import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  getProductById,
  searchProducts,
} from "../controllers/ProductController.js";

const router = express.Router();

router.get("", getAllProducts);
router.get("/search", searchProducts);

router.post("/add", createProduct);
router.get("/:id", getProductById);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;
