import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/UserRoute.js";
import authRoutes from "./routes/AuthRoute.js";
import productRoutes from "./routes/ProductRoute.js";
import uploadRoutes from "./routes/UploadRoute.js";
import brandRoutes from "./routes/BrandRoute.js";
import usagesRoutes from "./routes/UsageRoute.js";
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

app.use(authMiddleware);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/usages", usagesRoutes);

// Connect to DB and start server
connectDB().then(async () => {
  // await seed();
  app.listen(PORT, () => {
    console.log(`Server bắt đầu ở cổng ${PORT}`);
  });
});
