import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createReview,
  getProductReviews,
  getUserReviews,
  checkUserReviewedProduct,
  updateReview,
  deleteReview,
} from "../controllers/ReviewController.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews); // Get all reviews for a product

// Protected routes
router.use(authMiddleware);
router.post("/", createReview); // Create review
router.get("/my/list", getUserReviews); // Get user's reviews
router.get("/check/:productId", checkUserReviewedProduct); // Check if user reviewed product
router.patch("/:reviewId", updateReview); // Update review
router.delete("/:reviewId", deleteReview); // Delete review

export default router;
