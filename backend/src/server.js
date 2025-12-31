import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB, sequelize } from "./config/db.js";
import userRoutes from "./routes/UserRoute.js";
import authRoutes from "./routes/AuthRoute.js";
import productRoutes from "./routes/ProductRoute.js";
import uploadRoutes from "./routes/UploadRoute.js";
import brandRoutes from "./routes/BrandRoute.js";
import usagesRoutes from "./routes/UsageRoute.js";
import orderRoutes from "./routes/OrderRoute.js";
import reviewRoutes from "./routes/ReviewRoute.js";
import couponRoutes from "./routes/CouponRoute.js";
import paymentRoutes from "./routes/PaymentRoute.js";
import statisticsRoutes from "./routes/StatisticsRoute.js";
import adminRoutes from "./routes/AdminRoute.js";
import passport from "./config/passport.js";
import session from "express-session";
import { authMiddleware } from "./middleware/authMiddleware.js";
import "./models/Associations.js";
import path from "path";

import { seed } from "./seed.js";

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();
// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Production: Serve static files (TRƯỚC API routes)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
}

// Public routes (không cần auth)
app.use("/api/auth", authRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes); // Public read, protected write
app.use("/api/payment", paymentRoutes); // Payment routes (create auth, callback/ipn public)
app.use("/api/statistics", statisticsRoutes); // Statistics (có thể public hoặc protected tùy yêu cầu)

// Protected routes (cần auth)
app.use(authMiddleware);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/usages", usagesRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Production: SPA routing (CUỐI CÙNG, match routes không phải /api)
if (process.env.NODE_ENV === "production") {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Connect to DB and start server
connectDB().then(async () => {
  await sequelize.sync();
  // await seed();
  app.listen(PORT, () => {
    console.log(`Server bắt đầu ở cổng ${PORT}`);
  });
});
