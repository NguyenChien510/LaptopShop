import express from "express";
import Usage from "../models/Usage.js";

const router = express.Router();

// Lấy tất cả category (dùng cho mục đích sử dụng / usage)
router.get("/", async (req, res) => {
  try {
    const usages = await Usage.findAll();
    res.json(usages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
