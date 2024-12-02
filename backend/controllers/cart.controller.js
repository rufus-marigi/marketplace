import Product from "../models/product.model.js";
export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });
    //add the quantity for each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return {
        ...product.toJSON(),
        quantity: item.quantity,
      };
    });
    res.json(cartItems); // Return the cart items with their quantities
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body; // Extract product ID from the request body
    const user = req.user; // The authenticated user, assumed to be populated by middleware

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if the product already exists in the cart
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // If the product exists, increment its quantity
      existingItem.quantity += 1;
    } else {
      // If the product does not exist, add it to the cart
      user.cartItems.push({ product: productId, quantity: 1 });
    }

    // Save the updated user document
    await user.save();

    res.status(201).json(user.cartItems); // Return the updated cart items
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Controller to remove all products from the cart or a specific product
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body; // Extract productId from the request body
    const user = req.user; // The authenticated user, assumed to be populated by middleware

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!productId) {
      // If no productId is provided, clear the entire cart
      user.cartItems = [];
    } else {
      // If productId is provided, remove the specific product from the cart
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    }

    // Save the updated user document
    await user.save();

    // Respond with the updated cart items
    res.json({ cartItems: user.cartItems });
  } catch (error) {
    console.error("Error in removeAllFromCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to update the quantity of a specific product in the cart
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === !productId);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        res.json({ cartItems: user.cartItems });
      }
      existingItem.quantity = quantity;
      await user.save();
      res.json({ cartItems: user.cartItems });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Error in updateQuantity controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
