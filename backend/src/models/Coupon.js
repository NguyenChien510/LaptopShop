import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "Discount percentage (e.g., 10 for 10%)",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "0",
      allowNull: false,
      comment: "0: Available, 1: Not Available",
    },
  },
  {
    tableName: "coupons",
    timestamps: true, // createdAt & updatedAt
  }
);

export default Coupon;
