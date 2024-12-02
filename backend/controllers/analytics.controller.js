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
