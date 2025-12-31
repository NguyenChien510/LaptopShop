import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Usage from "../models/Usage.js";
import { sequelize } from "../config/db.js";
import { Op } from "sequelize";

// Lấy thống kê tổng quan
export const getDashboardStats = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm
    const products = await Product.findAll();

    // Thống kê hiện tại
    const totalRevenue = products.reduce(
      (sum, p) => sum + p.price * (p.sold || 0),
      0
    );
    const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);
    const totalProducts = products.length;

    // Tính doanh thu theo tháng (phân bổ dựa trên tổng)
    const revenueByMonth = [
      {
        month: "T1",
        revenue: Math.round(totalRevenue * 0.07),
        orders: Math.floor(totalSold * 0.07),
      },
      {
        month: "T2",
        revenue: Math.round(totalRevenue * 0.08),
        orders: Math.floor(totalSold * 0.08),
      },
      {
        month: "T3",
        revenue: Math.round(totalRevenue * 0.075),
        orders: Math.floor(totalSold * 0.075),
      },
      {
        month: "T4",
        revenue: Math.round(totalRevenue * 0.09),
        orders: Math.floor(totalSold * 0.09),
      },
      {
        month: "T5",
        revenue: Math.round(totalRevenue * 0.085),
        orders: Math.floor(totalSold * 0.085),
      },
      {
        month: "T6",
        revenue: Math.round(totalRevenue * 0.1),
        orders: Math.floor(totalSold * 0.1),
      },
      {
        month: "T7",
        revenue: Math.round(totalRevenue * 0.11),
        orders: Math.floor(totalSold * 0.11),
      },
      {
        month: "T8",
        revenue: Math.round(totalRevenue * 0.105),
        orders: Math.floor(totalSold * 0.105),
      },
      {
        month: "T9",
        revenue: Math.round(totalRevenue * 0.12),
        orders: Math.floor(totalSold * 0.12),
      },
      {
        month: "T10",
        revenue: Math.round(totalRevenue * 0.13),
        orders: Math.floor(totalSold * 0.13),
      },
      {
        month: "T11",
        revenue: Math.round(totalRevenue * 0.14),
        orders: Math.floor(totalSold * 0.14),
      },
      {
        month: "T12",
        revenue: Math.round(totalRevenue * 0.16),
        orders: Math.floor(totalSold * 0.16),
      },
    ];

    const totalOrders = revenueByMonth.reduce((sum, m) => sum + m.orders, 0);

    // Tính % tăng/giảm so với tháng trước (so sánh tháng cuối với tháng trước nó)
    const currentMonth = revenueByMonth[revenueByMonth.length - 1];
    const lastMonth = revenueByMonth[revenueByMonth.length - 2];

    const revenueChange =
      lastMonth.revenue > 0
        ? (
            ((currentMonth.revenue - lastMonth.revenue) / lastMonth.revenue) *
            100
          ).toFixed(1)
        : 0;

    const ordersChange =
      lastMonth.orders > 0
        ? (
            ((currentMonth.orders - lastMonth.orders) / lastMonth.orders) *
            100
          ).toFixed(1)
        : 0;

    const soldChange =
      lastMonth.orders > 0
        ? (
            ((currentMonth.orders - lastMonth.orders) / lastMonth.orders) *
            100
          ).toFixed(1)
        : 0;

    // Top sản phẩm bán chạy
    const topProducts = products
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        sales: p.sold || 0,
        revenue: p.price * (p.sold || 0),
      }));

    // Phân bố theo Usage
    const usages = await Usage.findAll({
      include: [
        {
          model: Product,
          through: { attributes: [] },
          attributes: ["id"],
        },
      ],
    });

    const usageData = usages.map((usage) => ({
      name: usage.name,
      value: usage.Products ? usage.Products.length : 0,
    }));

    // Tính phần trăm
    const totalUsageProducts = usageData.reduce((sum, u) => sum + u.value, 0);
    const usageDistribution = usageData.map((u) => ({
      name: u.name,
      value:
        totalUsageProducts > 0
          ? Math.round((u.value / totalUsageProducts) * 100)
          : 0,
      count: u.value,
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalSold,
          totalProducts,
          totalOrders,
          revenueChange: parseFloat(revenueChange),
          ordersChange: parseFloat(ordersChange),
          soldChange: parseFloat(soldChange),
        },
        revenueByMonth,
        topProducts,
        usageDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy phân bố theo usage
export const getUsageDistribution = async (req, res) => {
  try {
    const usages = await Usage.findAll({
      include: [
        {
          model: Product,
          through: { attributes: [] },
          attributes: ["id"],
        },
      ],
    });

    const usageData = usages.map((usage) => ({
      name: usage.name,
      count: usage.Products ? usage.Products.length : 0,
    }));

    // Tính phần trăm
    const total = usageData.reduce((sum, u) => sum + u.count, 0);
    const distribution = usageData.map((u) => ({
      name: u.name,
      value: total > 0 ? Math.round((u.count / total) * 100) : 0,
      count: u.count,
    }));

    res.json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error("Error fetching usage distribution:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
