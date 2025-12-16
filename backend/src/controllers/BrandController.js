import Brand from "../models/Brand.js";
import Series from "../models/Series.js";

// Lấy tất cả brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      order: [["name", "ASC"]],
    });
    return res.json(brands);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả brands kèm series
export const getAllBrandsWithSeries = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      include: [
        {
          model: Series,
          as: "Series",
        },
      ],
      order: [["name", "ASC"]],
    });
    return res.json(brands);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Lấy brand theo ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id, {
      include: [
        {
          model: Series,
          as: "Series",
        },
      ],
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    return res.json(brand);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Lấy series theo brandId
export const getSeriesByBrandId = async (req, res) => {
  try {
    const { brandId } = req.params;
    const brand = await Brand.findByPk(brandId, {
      include: [
        {
          model: Series,
          as: "Series",
        },
      ],
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    return res.json(brand.Series || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Tạo brand mới
export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const brand = await Brand.create({ name });
    return res.status(201).json(brand);
  } catch (err) {
    console.error(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Brand name already exists" });
    }
    return res.status(500).json({ message: err.message });
  }
};

// Cập nhật brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    await brand.update({ name });
    return res.json(brand);
  } catch (err) {
    console.error(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Brand name already exists" });
    }
    return res.status(500).json({ message: err.message });
  }
};

// Xóa brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    await brand.destroy();
    return res.json({ message: "Brand deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
