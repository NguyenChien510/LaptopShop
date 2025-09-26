import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB, sequelize } from "./config/db.js";
import userRoutes from "./routes/UserRoute.js";
import authRoutes from "./routes/AuthRoute.js";
import passport from "./config/passport.js";
import session from "express-session";
import { authMiddleware } from "./middleware/authMiddleware.js";

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

// Connect to DB and start server
connectDB().then(async () => {
  await sequelize.sync({ alter: false }); // tạo bảng nếu chưa có
  app.listen(PORT, () => {
    console.log(`Server bắt đầu ở cổng ${PORT}`);
  });
});
