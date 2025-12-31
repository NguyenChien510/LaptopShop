import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeMiddleware.js";
import { getAllOrders } from "../controllers/OrderController.js";

const router = express.Router();

// Admin routes - only admin can access
router.get("/orders", authMiddleware, authorizeRoles("admin"), getAllOrders);

export default router;
