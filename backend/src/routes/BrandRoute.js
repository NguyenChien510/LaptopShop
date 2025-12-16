import express from "express";
import {
  getAllBrands,
  getAllBrandsWithSeries,
  getBrandById,
  getSeriesByBrandId,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/BrandController.js";

const router = express.Router();

// GET /api/brands - Lấy tất cả brands (cho filter dropdown)
router.get("/", getAllBrands);

// GET /api/brands/with-series - Lấy brands kèm series
router.get("/with-series", getAllBrandsWithSeries);

// GET /api/brands/:id - Lấy brand theo ID
router.get("/:id", getBrandById);

// GET /api/brands/:brandId/series - Lấy series theo brandId
router.get("/:brandId/series", getSeriesByBrandId);

// POST /api/brands - Tạo brand mới
router.post("/", createBrand);

// PUT /api/brands/:id - Cập nhật brand
router.put("/:id", updateBrand);

// DELETE /api/brands/:id - Xóa brand
router.delete("/:id", deleteBrand);

export default router;
