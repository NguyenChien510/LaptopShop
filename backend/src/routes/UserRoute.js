import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeMiddleware.js";
import {
  deleteUser,
  getAllUsers,
  updateUser,
  getProfile,
  updateProfile,
} from "../controllers/UserController.js";

const router = express.Router();

// Profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Admin routes
router.get("", authMiddleware, authorizeRoles("admin"), getAllUsers);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteUser);

export default router;
