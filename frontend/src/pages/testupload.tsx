import { useState } from "react";
import axios from "@/lib/axios";

function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...selectedFiles]);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...previewUrls]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return alert("Chọn file trước");

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file)); // backend dùng upload.array("images")

    try {
      const { data } = await axios.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // data.urls là mảng các URL từ backend
      setUploadedUrls(data.urls);
      alert("Upload thành công!");
    } catch (err) {
      console.error(err);
      alert("Upload thất bại");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Test Upload Nhiều Ảnh</h2>
      <input type="file" multiple onChange={handleFileChange} />
      {previews.length > 0 && (
        <div style={{ margin: "10px 0" }}>
          <p>Preview:</p>
          {previews.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`preview-${idx}`}
              width="100"
              style={{ marginRight: "10px" }}
            />
          ))}
        </div>
      )}
      <button onClick={handleUpload} className="cursor-pointer">
        Upload
      </button>
      {uploadedUrls.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <p>Ảnh đã upload:</p>
          {uploadedUrls.map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ display: "block" }}
            >
              {url}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
