import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createPaymentUrl,
  handlePaymentCallback,
  handlePaymentIPN,
} from "../controllers/PaymentController.js";

const router = express.Router();

// Tạo URL thanh toán - cần auth
router.post("/create-payment-url", authMiddleware, createPaymentUrl);

// Callback từ VNPAY khi user quay lại - không cần auth
router.get("/callback", handlePaymentCallback);

// IPN từ VNPAY - không cần auth
router.get("/ipn", handlePaymentIPN);

export default router;
