import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Aggregate total sales and revenue
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: null, // Group all orders
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const { totalSales = 0, totalRevenue = 0 } = salesData[0] || {};

    return {
      users: totalUsers,
      products: totalProducts,
      totalSales,
      totalRevenue,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error.message);
    throw new Error("Unable to fetch analytics data.");
  }
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 }, // Total number of orders
          revenue: { $sum: "$totalAmount" }, // Total revenue for each date
        },
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
    ]);

    // Ensure all dates are included, even with no data
    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.sales || 0, // Default to 0 if no sales
        revenue: foundData?.revenue || 0, // Default to 0 if no revenue
      };
    });
  } catch (error) {
    console.error("Error fetching daily sales data:", error.message);
    throw new Error("Unable to fetch daily sales data.");
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Format date to YYYY-MM-DD
    dates.push(currentDate.toISOString().split("T")[0]);
    // Increment by one day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// analytics.controller.js
export const getTopProducts = async () => {
  try {
    // Aggregate the orders to calculate total sales and revenue for each product
    const topProducts = await Order.aggregate([
      {
        $unwind: "$products", // Unwind the products array
      },
      {
        $group: {
          _id: "$products.product", // Group by product ID
          totalSales: { $sum: "$products.quantity" }, // Total quantity sold for each product
          totalRevenue: {
            $sum: { $multiply: ["$products.quantity", "$products.price"] },
          }, // Total revenue for each product
        },
      },
      {
        $sort: { totalSales: -1 }, // Sort by total sales in descending order
      },
      { $limit: 5 }, // Limit to top 5 products
    ]);

    // Fetch product details (name, etc.) for each product in the aggregation result
    const productIds = topProducts.map((product) => product._id);
    const productsDetails = await Product.find({ _id: { $in: productIds } });

    // Combine the aggregated data with the product details (name, etc.)
    const productsWithDetails = topProducts.map((product) => {
      const productDetails = productsDetails.find(
        (p) => p._id.toString() === product._id.toString()
      );
      return {
        name: productDetails ? productDetails.name : "Unknown Product", // Get product name
        totalSales: product.totalSales,
        totalRevenue: product.totalRevenue,
      };
    });

    return productsWithDetails; // Return the top products with details
  } catch (error) {
    console.error("Error fetching top products:", error);
    throw new Error("Unable to fetch top products.");
  }
};
