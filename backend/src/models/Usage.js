import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Usage = sequelize.define("Usage", {
  name: { type: DataTypes.STRING, allowNull: false, unique: true }, // Ten nhu cau su dung
});

export default Usage;
