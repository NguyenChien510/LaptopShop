import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  const publicPaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google",
    "/api/auth/google/callback",
    "/api/auth/refresh",
    "/api/auth/resetpassword",
    "/api/auth/verify-otp",
    "/api/auth/reset-password",
    "/api/auth/check",
    "/api/uploads",
  ];
  if (
    publicPaths.includes(req.path) ||
    req.path.startsWith("/api/brands") ||
    req.path.startsWith("/api/usages") ||
    req.path.startsWith("/api/products")
  )
    return next();
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user; // lưu user vào req để middleware khác dùng
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const authOptional = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    req.user = user || null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};
