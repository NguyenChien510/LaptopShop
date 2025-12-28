import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Create review (one per user per product)
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Đánh giá phải từ 1 đến 5",
      });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { userId: req.user.id, productId },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi",
      });
    }

    // Create review
    const review = await Review.create({
      userId: req.user.id,
      productId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Đánh giá đã được gửi",
      data: review,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đánh giá",
    });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { productId },
      include: [{ model: User, attributes: ["id", "username", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy đánh giá",
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "thumbnail"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy đánh giá",
    });
  }
};

// Check if user reviewed product
export const checkUserReviewedProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const review = await Review.findOne({
      where: { userId: req.user.id, productId },
    });

    res.json({
      success: true,
      reviewed: !!review,
      data: review || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra đánh giá",
    });
  }
};

// Update review (user can edit their own review)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Đánh giá không tồn tại",
      });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền chỉnh sửa đánh giá này",
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Đánh giá phải từ 1 đến 5",
      });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    res.json({
      success: true,
      message: "Đánh giá đã cập nhật",
      data: review,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật đánh giá",
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Đánh giá không tồn tại",
      });
    }

    if (review.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xóa đánh giá này",
      });
    }

    await review.destroy();

    res.json({
      success: true,
      message: "Đánh giá đã xóa",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đánh giá",
    });
  }
};
