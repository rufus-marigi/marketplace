import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Import routes
import authRoutes from "./routes/auth.route.js";

import productRoutes from "./routes/product.route.js";

import cartRoutes from "./routes/cart.route.js";

import couponRoutes from "./routes/coupon.route.js";

import paymentRoutes from "./routes/payment.route.js";

import analyticsRoutes from "./routes/analytics.route.js";

// Import database connection function
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json({ limit: "10mb" }));

// Middleware to parse cookies

app.use(cookieParser()); //allows cookies to be parsed

// Routes
app.use("/api/auth", authRoutes); //allows access to auth routes
app.use("/api/products", productRoutes); //allows access to products routes
app.use("/api/cart", cartRoutes); //allows access to cart routes
app.use("/api/coupons", couponRoutes); //allows access to coupon routes
app.use("/api/payments", paymentRoutes); //allows access to payment routes
app.use("/api/analytics", analyticsRoutes); //allows access to analytics routes

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message:
      "user validation failed: email: email is required, password: password is required",
  });
});

// Start the server and connect to the database
const startServer = async () => {
  try {
    await connectDB(); // Ensure the database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1); // Exit the process with failure code
  }
};

startServer();
