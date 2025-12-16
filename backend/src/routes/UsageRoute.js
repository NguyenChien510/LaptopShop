import express from "express";
import {
  getAllUsages,
  getUsageById,
  createUsage,
  updateUsage,
  deleteUsage,
} from "../controllers/UsageController.js";

const router = express.Router();

// GET /api/usages - Lấy tất cả usages
router.get("/", getAllUsages);

// GET /api/usages/:id - Lấy usage theo ID
router.get("/:id", getUsageById);

// POST /api/usages - Tạo usage mới
router.post("/", createUsage);

// PUT /api/usages/:id - Cập nhật usage
router.put("/:id", updateUsage);

// DELETE /api/usages/:id - Xóa usage
router.delete("/:id", deleteUsage);

export default router;
