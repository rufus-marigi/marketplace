import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    // Validate the products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid products data" });
    }

    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // Stripe expects amount in cents
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: process.env.CURRENCY || "kes", // Default to KES, set via env variable
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity,
      };
    });

    // Apply coupon code if provided
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Stripe card payment
      // TODO: Integrate M-Pesa payment option using a third-party gateway (e.g., Flutterwave, Safaricom API)
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            price: p.price,
            quantity: p.quantity,
          }))
        ),
      },
    });

    // Create new coupon for large purchases (if total exceeds $20 equivalent in KES)
    if (totalAmount >= 2000 * 100) {
      // $20 in KES cents (2,000 KES)
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 }); // Return total in KES
  } catch (error) {
    console.error("Error in createCheckoutSession:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  // Handle successful checkout and update order status
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    //check if payment is successful
    if (session.payment_status === "paid") {
      //check for coupon and if it is used deactivate the coupon
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false }
        );
      }
      // create a new order
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100, //convert from cents to dollars
        stripeSessionId: sessionId,
      });
      await newOrder.save();
      res.status(200).json({
        success: true,
        message:
          "Payment successful, Order created, coupon deactivated if used",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.error("Error in checkout-success route:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to create a new Stripe coupon
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

// Helper function to create a new coupon for the user
async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });
  await newCoupon.save();
  return newCoupon;
}
