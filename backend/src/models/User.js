import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    // Address info
    city: { type: DataTypes.STRING, allowNull: true },
    district: { type: DataTypes.STRING, allowNull: true },
    street: { type: DataTypes.STRING, allowNull: true },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetOtp: { type: DataTypes.STRING, allowNull: true },
    resetOtpExpireAt: { type: DataTypes.DATE, allowNull: true },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
      allowNull: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export default User;
