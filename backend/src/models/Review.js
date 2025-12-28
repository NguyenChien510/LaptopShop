import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Review = sequelize.define(
  "Review",
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false }, // 1-5
    comment: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "productId"], // One review per user per product
      },
    ],
  }
);

export default Review;
