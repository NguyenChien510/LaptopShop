import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateStatus,
  cancelOrder,
} from "../controllers/OrderController.js";

const router = express.Router();

// All need auth
router.use(authMiddleware);

router.post("/", createOrder); // user creates
router.get("/my", getMyOrders); // my orders
router.get("/:id", getOrderById); // access restricted to owner/admin
router.patch("/:id/status", authorizeRoles("admin"), updateStatus); // admin updates
router.post("/:id/cancel", cancelOrder); // user cancels own order

export default router;
