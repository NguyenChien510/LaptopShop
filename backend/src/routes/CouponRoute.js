import express from "express";
import {
  validateCoupon,
  createCoupon,
} from "../controllers/CouponController.js";

const router = express.Router();

router.post("/validate", validateCoupon);
router.post("/add", createCoupon);

export default router;
