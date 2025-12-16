import Usage from "../models/Usage.js";

// Lấy tất cả usages
export const getAllUsages = async (req, res) => {
  try {
    const usages = await Usage.findAll({
      order: [["name", "ASC"]],
    });
    return res.json(usages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Lấy usage theo ID
export const getUsageById = async (req, res) => {
  try {
    const { id } = req.params;
    const usage = await Usage.findByPk(id);

    if (!usage) {
      return res.status(404).json({ message: "Usage not found" });
    }

    return res.json(usage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Tạo usage mới
export const createUsage = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Usage name is required" });
    }

    const usage = await Usage.create({ name });
    return res.status(201).json(usage);
  } catch (err) {
    console.error(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Usage name already exists" });
    }
    return res.status(500).json({ message: err.message });
  }
};

// Cập nhật usage
export const updateUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const usage = await Usage.findByPk(id);

    if (!usage) {
      return res.status(404).json({ message: "Usage not found" });
    }

    await usage.update({ name });
    return res.json(usage);
  } catch (err) {
    console.error(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Usage name already exists" });
    }
    return res.status(500).json({ message: err.message });
  }
};

// Xóa usage
export const deleteUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const usage = await Usage.findByPk(id);

    if (!usage) {
      return res.status(404).json({ message: "Usage not found" });
    }

    await usage.destroy();
    return res.json({ message: "Usage deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
