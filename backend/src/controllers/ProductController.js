import Product from "../models/Product.js";
import Usage from "../models/Usage.js";
import Brand from "../models/Brand.js";
import Series from "../models/Series.js";
import { Op } from "sequelize";
import { sequelize } from "../config/db.js";

export const getAllProducts = async (req, res) => {
  try {
    const { brandId, seriesId, cpuId, ramId, ssdId, displayId, usageId } =
      req.query;

    let whereClause = {};

    if (brandId) {
      whereClause.brandId = brandId;
    }

    if (seriesId) {
      whereClause.seriesId = seriesId;
    }

    const includeOptions = [
      { model: Brand, attributes: ["id", "name"] },
      { model: Series, attributes: ["id", "name"] },
    ];

    // Filter theo usage (many-to-many relationship)
    if (usageId) {
      includeOptions.push({
        model: Usage,
        where: { id: usageId },
        through: { attributes: [] },
        required: true,
      });
    } else {
      // Include Usage khi không filter, để trả về đầy đủ info
      includeOptions.push({
        model: Usage,
        attributes: ["id", "name"],
        through: { attributes: [] },
      });
    }

    // Fetch products with basic filters first
    let products = await Product.findAll({
      where: whereClause,
      include: includeOptions,
    });

    // Filter theo specs trong shortSpecs JSON - client-side filtering
    if (cpuId) {
      products = products.filter((p) => {
        // Parse shortSpecs if it's a string
        const specs =
          typeof p.shortSpecs === "string"
            ? JSON.parse(p.shortSpecs)
            : p.shortSpecs;

        const cpuSpec = specs?.find((s) => s.id === "cpu");
        // Search by id (i5) in value (I5-13400K)
        const match = cpuSpec?.value
          ?.toLowerCase()
          .includes(cpuId.toLowerCase());
        return match;
      });
    }

    if (ramId) {
      products = products.filter((p) => {
        const specs =
          typeof p.shortSpecs === "string"
            ? JSON.parse(p.shortSpecs)
            : p.shortSpecs;

        const ramSpec = specs?.find((s) => s.id === "ram");
        return ramSpec?.value?.toLowerCase().includes(ramId.toLowerCase());
      });
    }

    if (ssdId) {
      products = products.filter((p) => {
        const specs =
          typeof p.shortSpecs === "string"
            ? JSON.parse(p.shortSpecs)
            : p.shortSpecs;

        const ssdSpec = specs?.find((s) => s.id === "ssd");
        return ssdSpec?.value?.toLowerCase().includes(ssdId.toLowerCase());
      });
    }

    if (displayId) {
      products = products.filter((p) => {
        const specs =
          typeof p.shortSpecs === "string"
            ? JSON.parse(p.shortSpecs)
            : p.shortSpecs;

        const displaySpec = specs?.find((s) => s.id === "display");
        return displaySpec?.value
          ?.toLowerCase()
          .includes(displayId.toLowerCase());
      });
    }

    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Tìm kiếm sản phẩm theo tên (gợi ý nhanh khi người dùng nhập)
export const searchProducts = async (req, res) => {
  try {
    const { q = "", limit = 5 } = req.query;
    const keyword = q.toString().trim().toLowerCase();

    if (!keyword) {
      return res.json([]);
    }

    const products = await Product.findAll({
      where: sequelize.where(sequelize.fn("LOWER", sequelize.col("name")), {
        [Op.like]: `%${keyword}%`,
      }),
      attributes: ["id", "name", "price", "thumbnail"],
      order: [["name", "ASC"]],
      limit: Number(limit) || 5,
    });

    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      price,
      stock = 0,
      sale = 0,
      thumbnail,
      images = [],
      shortSpecs,
      detailSpecs,
      brandId,
      seriesId,
      usageIds = [],
    } = req.body;

    // 1. VALIDATION CƠ BẢN
    if (!name?.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tên sản phẩm là bắt buộc",
      });
    }

    if (price === undefined || price === null) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Giá sản phẩm là bắt buộc",
      });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Giá sản phẩm không hợp lệ",
      });
    }

    if (!thumbnail?.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Ảnh thumbnail là bắt buộc",
      });
    }

    // 2. VALIDATE FOREIGN KEYS TRƯỚC
    let validBrandId = null;
    let validSeriesId = null;

    // Validate brandId nếu có
    if (brandId) {
      const brandIdNum = parseInt(brandId);
      if (!isNaN(brandIdNum)) {
        const brandExists = await Brand.findByPk(brandIdNum, { transaction });
        if (!brandExists) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Brand với ID ${brandId} không tồn tại`,
          });
        }
        validBrandId = brandIdNum;
      }
    }

    // Validate seriesId nếu có
    if (seriesId) {
      const seriesIdNum = parseInt(seriesId);
      if (!isNaN(seriesIdNum)) {
        const seriesExists = await Series.findByPk(seriesIdNum, {
          transaction,
        });

        if (!seriesExists) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Series với ID ${seriesId} không tồn tại`,
          });
        }

        // Kiểm tra series có thuộc brand không (nếu có brandId)
        if (validBrandId && seriesExists.brandId !== validBrandId) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Series không thuộc brand đã chọn`,
          });
        }

        validSeriesId = seriesIdNum;
      }
    }

    // 3. PARSE DỮ LIỆU
    // Parse images
    let parsedImages = images;
    if (typeof parsedImages === "string") {
      if (parsedImages.trim().startsWith("[")) {
        try {
          parsedImages = JSON.parse(parsedImages);
        } catch {
          parsedImages = [];
        }
      } else {
        parsedImages = parsedImages
          .split(",")
          .map((img) => img.trim())
          .filter((img) => img.length > 0);
      }
    }

    if (!Array.isArray(parsedImages)) {
      parsedImages = [];
    }

    // Parse specs
    let parsedShortSpecs = shortSpecs;
    let parsedDetailSpecs = detailSpecs;

    const parseSpecs = (specs) => {
      if (!specs) return {};
      if (typeof specs === "string") {
        try {
          return JSON.parse(specs);
        } catch {
          return { description: specs };
        }
      }
      if (typeof specs === "object") {
        return specs;
      }
      return {};
    };

    parsedShortSpecs = parseSpecs(shortSpecs);
    parsedDetailSpecs = parseSpecs(detailSpecs);

    // 4. TẠO PRODUCT
    const productData = {
      name: name.trim(),
      price: priceNum,
      stock: parseInt(stock) || 0,
      sale: parseInt(sale) || 0,
      thumbnail: thumbnail.trim(),
      images: parsedImages,
      shortSpecs: parsedShortSpecs,
      detailSpecs: parsedDetailSpecs,
      brandId: validBrandId,
      seriesId: validSeriesId,
    };

    // Log để debug
    console.log("[CREATE PRODUCT] Creating with:", {
      ...productData,
      shortSpecs: "parsed",
      detailSpecs: "parsed",
    });

    const product = await Product.create(productData, { transaction });

    // 5. XỬ LÝ USAGES
    let parsedUsageIds = usageIds;
    if (typeof parsedUsageIds === "string") {
      if (parsedUsageIds.trim().startsWith("[")) {
        try {
          parsedUsageIds = JSON.parse(parsedUsageIds);
        } catch {
          parsedUsageIds = parsedUsageIds
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));
        }
      } else {
        parsedUsageIds = parsedUsageIds
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
      }
    }

    if (Array.isArray(parsedUsageIds) && parsedUsageIds.length > 0) {
      // Validate usages tồn tại
      const validUsages = await Usage.findAll({
        where: { id: parsedUsageIds },
        transaction,
      });

      const validUsageIds = validUsages.map((u) => u.id);
      const invalidUsageIds = parsedUsageIds.filter(
        (id) => !validUsageIds.includes(id)
      );

      if (invalidUsageIds.length > 0) {
        console.warn(
          `[CREATE PRODUCT] Invalid usage IDs: ${invalidUsageIds.join(", ")}`
        );
      }

      if (validUsageIds.length > 0) {
        await product.setUsages(validUsageIds, { transaction });
      }
    }

    // 6. COMMIT TRANSACTION
    await transaction.commit();

    // 7. LẤY PRODUCT VỚI THÔNG TIN ĐẦY ĐỦ
    const productWithDetails = await Product.findByPk(product.id, {
      include: [
        { model: Brand, attributes: ["id", "name"] },
        { model: Series, attributes: ["id", "name"] },
        {
          model: Usage,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    // 8. TRẢ VỀ RESPONSE
    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: productWithDetails,
    });
  } catch (error) {
    // Rollback transaction nếu có lỗi
    await transaction.rollback();

    console.error("[CREATE PRODUCT] Error:", error);

    // Xử lý các lỗi cụ thể
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Tên sản phẩm đã tồn tại",
      });
    }

    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: messages,
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      console.error("Foreign key constraint error details:", error);

      // Phân tích thêm để biết chính xác lỗi gì
      if (error.original && error.original.sqlMessage) {
        console.error("SQL Error:", error.original.sqlMessage);
      }

      return res.status(400).json({
        success: false,
        message: "Tham chiếu không hợp lệ. Vui lòng kiểm tra brand hoặc series",
        error: error.parent ? error.parent.sqlMessage : error.message,
      });
    }

    // Lỗi server
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo sản phẩm",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateProduct = async (id, productData) => {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("Product not found");
  return await product.update(productData);
};

export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("Product not found");
  await product.destroy();
  return product;
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Brand, attributes: ["id", "name"] },
        { model: Series, attributes: ["id", "name"] },
        {
          model: Usage,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
