import Coupon from "../models/Coupon.js";

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
