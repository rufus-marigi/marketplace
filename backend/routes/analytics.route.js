import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analytics.controller.js";

const router = express.Router();

// Fetch general analytics data
router.get("/", protectRoute, adminRoute, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();
    res.json(analyticsData);
  } catch (error) {
    console.error("Error in analytics route:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Fetch daily sales data
router.get("/daily-sales", protectRoute, adminRoute, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
    const end = endDate ? new Date(endDate) : new Date();

    const dailySalesData = await getDailySalesData(start, end);
    res.json(dailySalesData);
  } catch (error) {
    console.error("Error in daily sales route:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
