import express from "express"; // Import Express for routing
import { protectRoute } from "../middleware/auth.middleware.js"; // Import the protectRoute middleware
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js"; // Import the controller functions

const router = express.Router(); // Create a new Express router instance

// Route to get the current user's coupon information
router.get("/", protectRoute, getCoupon);

// Route to validate a coupon
router.post("/validate", protectRoute, validateCoupon);

export default router; // Export the router for use in the main app
