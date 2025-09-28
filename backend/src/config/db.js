import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Nếu database chưa có, Sequelize sẽ tạo khi dùng `sync()`
//Local MySQL
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

// Cloud MySQL (TiDB Cloud)
// export const sequelize = new Sequelize(process.env.DATABASE_URL_CLOUD, {
//   dialect: "mysql",
//   dialectOptions: {
//     ssl: {
//       rejectUnauthorized: true,
//     },
//   },
//   logging: false,
// });

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công");
    // Tạo bảng nếu chưa có
    await sequelize.sync({ alter: true });
    // { force: true } => xóa toàn bộ table rồi tạo lại
    // { alter: true } => cập nhật schema, giữ data
  } catch (error) {
    console.error("❌ Lỗi kết nối MySQL:", error);
    process.exit(1);
  }
};
