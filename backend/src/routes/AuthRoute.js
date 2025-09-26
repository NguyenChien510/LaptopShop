import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  logout,
  refreshToken,
  sendResetPasswordOTP,
  verifyOTP,
  resetPassword,
  googleCallback,
} from "../controllers/AuthController.js";
import { authOptional } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/resetpassword", sendResetPasswordOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback sau khi Google xác thực
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

router.get("/check", authOptional, (req, res) => {
  if (!req.user) {
    return res.json({ loggedIn: false });
  }
  res.json({ loggedIn: true, user: req.user });
});

export default router;
