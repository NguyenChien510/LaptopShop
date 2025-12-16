import Product from "../models/Product.js";
import Usage from "../models/Usage.js";
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

    const includeOptions = [];

    // Filter theo usage (many-to-many relationship)
    if (usageId) {
      includeOptions.push({
        model: Usage,
        where: { id: usageId },
        through: { attributes: [] },
        required: true,
      });
    }

    // Fetch products with basic filters first
    let products = await Product.findAll({
      where: whereClause,
      include: includeOptions.length > 0 ? includeOptions : undefined,
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
  try {
    const {
      name,
      price,
      stock,
      sale,
      thumbnail,
      images,
      shortSpecs,
      detailSpecs,
      brandId,
      seriesId,
      usage,
    } = req.body;

    // validate cơ bản
    if (!name || !price || !thumbnail || !shortSpecs || !detailSpecs) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      price,
      stock: stock || 0,
      sale: sale || 0,
      thumbnail,
      images: images || [],
      shortSpecs,
      detailSpecs,
      brandId: brandId || null,
      seriesId: seriesId || null,
    });

    // Nếu có usages
    if (usage && Array.isArray(usage) && usage.length > 0) {
      // usage = array of categoryId
      await product.setUsages(usage);
    }

    return res.status(201).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
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

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
