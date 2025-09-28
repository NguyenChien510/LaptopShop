import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Series = sequelize.define("Series", {
  name: { type: DataTypes.STRING, allowNull: false },
});

export default Series;
