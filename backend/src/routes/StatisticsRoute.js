import express from "express";
import {
  getDashboardStats,
  getUsageDistribution,
} from "../controllers/StatisticsController.js";

const router = express.Router();

// GET /api/statistics/dashboard - Lấy thống kê dashboard
router.get("/dashboard", getDashboardStats);

// GET /api/statistics/usage-distribution - Lấy phân bố theo usage
router.get("/usage-distribution", getUsageDistribution);

export default router;
