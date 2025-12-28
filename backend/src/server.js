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
import passport from "./config/passport.js";
import session from "express-session";
import { authMiddleware } from "./middleware/authMiddleware.js";
import "./models/Associations.js";

import { seed } from "./seed.js";

const PORT = process.env.PORT || 5001;

const app = express();
// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // hoặc domain frontend của bạn
    credentials: true, // ✅ Cho phép gửi cookie
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Debug endpoint - kiểm tra series trong database
app.get("/debug/series", async (req, res) => {
  try {
    const Series = (await import("./models/Series.js")).default;
    const allSeries = await Series.findAll();
    res.json({
      total: allSeries.length,
      series: allSeries.map((s) => ({ id: s.id, name: s.name })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint - test raw SQL insert
app.post("/debug/test-insert", async (req, res) => {
  try {
    const { name, price, seriesId, brandId } = req.body;
    const result = await sequelize.query(
      `INSERT INTO Products (name, price, stock, sold, sale, rateCount, sumRate, thumbnail, images, shortSpecs, detailSpecs, brandId, seriesId, createdAt, updatedAt)
       VALUES (?, ?, 0, 0, 0, 0, 0, 'test.jpg', '[]', '[]', '[]', ?, ?, NOW(), NOW())`,
      {
        replacements: [name, price, brandId || null, seriesId || null],
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.json({ success: true, message: "Raw SQL insert works", result });
  } catch (err) {
    console.log("[DEBUG TEST INSERT] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Public routes (không cần auth)
app.use("/api/auth", authRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes); // Public read, protected write

// Protected routes (cần auth)
app.use(authMiddleware);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/usages", usagesRoutes);
app.use("/api/orders", orderRoutes);

// Connect to DB and start server
connectDB().then(async () => {
  await sequelize.sync();
  // await seed();
  app.listen(PORT, () => {
    console.log(`Server bắt đầu ở cổng ${PORT}`);
  });
});
