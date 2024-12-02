import express from "express";
import {
  addToCart,
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";

// import protectRoute middleware

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// route to add product to cart

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart); //remove all from cart
router.put("/:id", protectRoute, updateQuantity); //update quantity with new quantity value

export default router;
