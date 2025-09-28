import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeMiddleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/ProductController.js";

const router = express.Router();

router.get("", getAllProducts);

router.post("/add", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;
