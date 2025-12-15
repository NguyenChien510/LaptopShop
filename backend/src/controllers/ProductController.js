import Product from "../models/Product.js";

export const getAllProducts = async (req, res) => {
  return res.json(await Product.findAll());
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
