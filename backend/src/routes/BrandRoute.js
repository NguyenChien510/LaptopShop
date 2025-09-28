import express from "express";
import Brand from "../models/Brand.js";
import Series from "../models/Series.js";

const router = express.Router();

// Lấy series theo brandId
router.get("/:brandId/series", async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.brandId, { include: Series });
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json(brand.Series || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy tất cả brand kèm series
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.findAll({ include: Series });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
