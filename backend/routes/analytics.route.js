import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailySalesData = await getDailySalesData(startDate, endDate);

    // Log the response to ensure data is correct
    console.log("Top Products Data:", analyticsData.topProducts); // Check the actual data

    res.json({
      analyticsData,
      dailySalesData,
    });
  } catch (error) {
    console.log("Error in analytics route", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// analytics.route.js
import { getTopProducts } from "../controllers/analytics.controller.js";

router.get("/top-products", protectRoute, adminRoute, async (req, res) => {
  try {
    const topProducts = await getTopProducts();
    res.json(topProducts);
  } catch (error) {
    console.log("Error in top products route", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
