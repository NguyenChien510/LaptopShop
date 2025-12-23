import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendOTP } from "../controllers/EmailController.js";

// Tạo Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m", // ngắn hạn
  });
};

// Tạo Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // dài hạn
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    // Simple validation
    if (!name || !email || !password || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }
    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already used" });
    }
    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      city: "",
      district: "",
      street: "",
    });
    // Tạo token
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Lưu refresh token vào DB
    await User.update({ refreshToken }, { where: { id: newUser.id } });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    newUser.password = undefined;
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Simple validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }
    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "User or password wrong!" });
    }
    // Tạo token
    const accessToken = generateAccessToken(existingUser);
    const refreshToken = generateRefreshToken(existingUser);

    await User.update({ refreshToken }, { where: { id: existingUser.id } });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 phút
    });
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { accessToken } = req.cookies;

    if (accessToken) {
      await User.update({ accessToken: null }, { where: { accessToken } });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ success: false, message: "Token expired or invalid" });

      const accessToken = generateAccessToken(user);
      return res.json({ success: true, accessToken });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendResetPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Tạo OTP (mã xác thực)
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Gửi OTP qua email
    await sendOTP(email, otp);

    // Lưu OTP và thời gian hết hạn trong DB
    user.resetOtp = otp;
    user.resetOtpExpireAt = new Date(Date.now() + 15 * 60 * 1000); // OTP hết hạn sau 15 phút
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- Verify OTP ---
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || !user.resetOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request again.",
      });
    }

    if (user.resetOtpExpireAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request again.",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP valid → clear OTP from DB (optional)
    user.resetOtp = null;
    user.resetOtpExpireAt = null;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- Reset Password ---
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const googleCallback = async (req, res) => {
  try {
    // req.user đã có từ passport-google-oauth20
    const user = req.user;

    // Tạo token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Lưu refresh token vào DB
    await User.update({ refreshToken }, { where: { id: user.id } });

    // Lưu access token vào cookie (cross-site friendly for frontend at 5173)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    // Redirect về frontend
    res.redirect("http://localhost:5173");
  } catch (error) {
    console.error("Google login error:", error);
    res.redirect("http://localhost:5001/login?error=google");
  }
};
