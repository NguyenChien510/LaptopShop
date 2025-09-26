import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Nếu database chưa có, Sequelize sẽ tạo khi dùng `sync()`
export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false, // tắt log SQL 
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công");
  } catch (error) {
    console.error("❌ Lỗi kết nối MySQL:", error);
    process.exit(1);
  }
};
