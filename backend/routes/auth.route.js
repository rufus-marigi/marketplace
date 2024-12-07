import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route to handle user signup
router.post("/signup", signup);

// Route to handle user login
router.post("/login", login);

// Route to handle user logout
router.post("/logout", logout);

// Route to refresh access tokens
router.post("/refresh-token", refreshToken);

// Route to fetch user profile (protected)
router.get("/profile", protectRoute, getProfile);

export default router;
