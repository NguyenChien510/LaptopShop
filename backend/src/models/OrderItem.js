import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    // Nullable to allow ON DELETE SET NULL on Product relation
    productId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false }, // snapshot
    price: { type: DataTypes.FLOAT, allowNull: false }, // per unit at order time
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    thumbnail: { type: DataTypes.STRING, allowNull: true },
  },
  { timestamps: true }
);

export default OrderItem;
