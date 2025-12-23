import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Brand = sequelize.define(
  "Brand",
  {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    tableName: "brands",
    timestamps: true,
  }
);

export default Brand;
