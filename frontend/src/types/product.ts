// src/types/product.ts
export interface ShortSpec {
  id: string;
  label: string;
  value: string;
}

export interface DetailSpec {
  id: string;
  category: string;
  label: string;
  value: string;
}

export interface Product {
  id: number; // Sequelize mặc định có khóa chính id
  name: string;
  price: number;
  stock: number;
  sold: number;
  sale: number;
  rateCount: number;
  sumRate: number;
  thumbnail: string;
  images?: string[]; // JSON: mảng ảnh chi tiết
  shortSpecs?: ShortSpec[]; // JSON: cấu hình nổi bật
  detailSpecs?: DetailSpec[]; // JSON: thông số chi tiết
  createdAt: string; // timestamps: true → Sequelize tự thêm
  updatedAt: string;
}
