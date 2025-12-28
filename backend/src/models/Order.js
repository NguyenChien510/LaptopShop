import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("Thanh toán thất bại", "Thanh toán thành công"),
      defaultValue: "Thanh toán thành công",
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("COD", "Online"),
      defaultValue: "COD",
      allowNull: false,
    },
    // Snapshot of shipping address at order time
    recipientName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: true },
    district: { type: DataTypes.STRING, allowNull: true },
    street: { type: DataTypes.STRING, allowNull: true },
    // Totals
    subtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    discount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { timestamps: true }
);

export default Order;
