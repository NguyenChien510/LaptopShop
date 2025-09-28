import express from "express";
import multer from "multer";
import { uploadImages } from "../controllers/UploadController.js";

const router = express.Router();

// Disk storage: lưu file tạm để Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Chỉ upload nhiều file với field name "images", tối đa 6 file
router.post("/", upload.array("images", 6), uploadImages);

export default router;
