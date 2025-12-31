import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeMiddleware.js";
import {
  getAllCoupons,
  validateCoupon,
  createCoupon,
  getCouponById,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
} from "../controllers/CouponController.js";

const router = express.Router();

router.get("/", getAllCoupons);
router.get("/:id", getCouponById);
router.post("/validate", validateCoupon);
router.post("/add", authMiddleware, authorizeRoles("admin"), createCoupon);
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateCoupon);
router.put(
  "/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  updateCouponStatus
);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteCoupon);

export default router;
