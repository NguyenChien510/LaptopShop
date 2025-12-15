import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Product = sequelize.define(
  "Product",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    brandId: { type: DataTypes.INTEGER, allowNull: true },
    seriesId: { type: DataTypes.INTEGER, allowNull: true },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    sold: { type: DataTypes.INTEGER, defaultValue: 0 },
    sale: { type: DataTypes.INTEGER, defaultValue: 0 },
    rateCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    sumRate: { type: DataTypes.FLOAT, defaultValue: 0 }, // tổng số sao (1–5)
    thumbnail: { type: DataTypes.STRING, allowNull: false },
    images: { type: DataTypes.JSON, allowNull: true }, // list ảnh chi tiết
    shortSpecs: { type: DataTypes.JSON, allowNull: false }, // cấu hình nổi bật (hiển thị card)
    detailSpecs: { type: DataTypes.JSON, allowNull: false }, // thông số chi tiết
  },
  { timestamps: true }
);

export default Product;
