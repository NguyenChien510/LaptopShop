import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeMiddleware.js";
import {
  deleteUser,
  getAllUsers,
  updateUser,
} from "../controllers/UserController.js";

const router = express.Router();

router.get("", authMiddleware, authorizeRoles("admin"), getAllUsers);

router.put("/:id", authMiddleware, updateUser);

router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteUser);

export default router;
