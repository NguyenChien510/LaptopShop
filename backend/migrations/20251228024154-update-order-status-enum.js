/** @type {import('sequelize-cli').Migration} */
const migration = {
  async up(queryInterface, Sequelize) {
    // 1) Thêm cột tạm với enum mới (tránh lỗi rename table khi ALTER trực tiếp)
    await queryInterface.addColumn("Orders", "status_tmp", {
      type: Sequelize.ENUM("Thanh toán thất bại", "Thanh toán thành công"),
      allowNull: false,
      defaultValue: "Thanh toán thành công",
    });

    // 2) Chuyển dữ liệu cũ sang cột tạm
    await queryInterface.sequelize.query(`
      UPDATE Orders
      SET status_tmp = CASE
        WHEN status IN ('pending','confirmed','shipping','delivered') THEN 'Thanh toán thành công'
        WHEN status = 'cancelled' THEN 'Thanh toán thất bại'
        ELSE 'Thanh toán thành công'
      END;
    `);

    // 3) Xóa cột cũ
    await queryInterface.removeColumn("Orders", "status");

    // 4) Đổi tên cột tạm thành cột chính
    await queryInterface.renameColumn("Orders", "status_tmp", "status");
  },

  async down(queryInterface, Sequelize) {
    // Down: khôi phục enum cũ (tạo cột tạm, sao chép, xóa, đổi tên)
    await queryInterface.addColumn("Orders", "status_tmp", {
      type: Sequelize.ENUM(
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    });

    await queryInterface.sequelize.query(`
      UPDATE Orders
      SET status_tmp = CASE
        WHEN status = 'Thanh toán thất bại' THEN 'cancelled'
        ELSE 'pending'
      END;
    `);

    await queryInterface.removeColumn("Orders", "status");
    await queryInterface.renameColumn("Orders", "status_tmp", "status");
  },
};

export default migration;
