import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Comment = sequelize.define(
  "Comment",
  {
    comment: { type: DataTypes.TEXT, allowNull: false },
    images: { type: DataTypes.JSON, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

export default Comment;
