import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("Thanh toán thất bại", "Thanh toán thành công"),
      defaultValue: "Thanh toán thất bại",
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("COD", "Online"),
      defaultValue: "COD",
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
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
    // VNPAY info
    paymentRef: { type: DataTypes.STRING, allowNull: true },
    transactionId: { type: DataTypes.STRING, allowNull: true },
  },
  { timestamps: true }
);

export default Order;
