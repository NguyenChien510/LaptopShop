import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeMiddleware.js";
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

router.post("/add", authMiddleware, authorizeRoles("admin"), createProduct);
router.get("/:id", getProductById);

router.put("/:id", authMiddleware, authorizeRoles("admin"), updateProduct);

router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteProduct);

export default router;
