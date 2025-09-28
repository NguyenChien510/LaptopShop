import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files" });

    const uploadedUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "laptopstore",
      });
      uploadedUrls.push(result.secure_url);

      // xóa file tạm
      fs.unlinkSync(file.path);
    }

    res.json({ urls: uploadedUrls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
