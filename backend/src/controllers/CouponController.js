import Coupon from "../models/Coupon.js";

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      data: coupons,
    });
  } catch (err) {
    console.error("Get coupons error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.trim() === "") {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if coupon is available (status = 0)
    if (coupon.status === "1") {
      return res.status(400).json({ message: "Coupon is no longer available" });
    }

    // Check if coupon has expired
    if (new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    return res.json({
      success: true,
      discount: coupon.discount,
      message: `Coupon applied successfully! You get ${coupon.discount}% discount`,
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiresAt } = req.body;

    // Validate input
    if (!code || !discount || !expiresAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (discount < 0 || discount > 100) {
      return res
        .status(400)
        .json({ message: "Discount must be between 0 and 100" });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Create new coupon
    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discount,
      expiresAt,
      status: "0", // Available by default
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (err) {
    console.error("Coupon creation error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.json({
      success: true,
      data: coupon,
    });
  } catch (err) {
    console.error("Get coupon by id error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount, expiresAt } = req.body;

    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Validate input
    if (discount !== undefined && (discount < 0 || discount > 100)) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100",
      });
    }

    // Check if new code already exists (if code is being updated)
    if (code && code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        where: { code: code.toUpperCase() },
      });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }
    }

    // Update coupon
    await coupon.update({
      code: code ? code.toUpperCase() : coupon.code,
      discount: discount !== undefined ? discount : coupon.discount,
      expiresAt: expiresAt || coupon.expiresAt,
    });

    return res.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (err) {
    console.error("Coupon update error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Toggle coupon status (active/inactive)
export const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (status !== "0" && status !== "1") {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 0 (active) or 1 (inactive)",
      });
    }

    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Update status
    await coupon.update({ status });

    return res.json({
      success: true,
      message: "Coupon status updated successfully",
      data: coupon,
    });
  } catch (err) {
    console.error("Coupon status update error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await coupon.destroy();

    return res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (err) {
    console.error("Coupon delete error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
