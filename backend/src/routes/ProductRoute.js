import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  getProductById,
} from "../controllers/ProductController.js";

const router = express.Router();

router.get("", getAllProducts);

router.post("/add", createProduct);
router.get("/:id", getProductById);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);


export default router;
