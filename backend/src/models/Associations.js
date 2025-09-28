import Brand from "./Brand.js";
import Series from "./Series.js";
import Usage from "./Usage.js";
import Product from "./Product.js";

// Brand - Series
Brand.hasMany(Series, { foreignKey: "brandId" });
Series.belongsTo(Brand, { foreignKey: "brandId" });

// Brand - Product
Brand.hasMany(Product, { foreignKey: "brandId" });
Product.belongsTo(Brand, { foreignKey: "brandId" });

// Series - Product
Series.hasMany(Product, { foreignKey: "seriesId" });
Product.belongsTo(Series, { foreignKey: "seriesId" });

// Product - Usage (Many-to-Many)
Product.belongsToMany(Usage, {
  through: "ProductUsages",
  foreignKey: "productId",
  onDelete: "CASCADE",
});
Usage.belongsToMany(Product, {
  through: "ProductUsages",
  foreignKey: "usageId",
  onDelete: "CASCADE",
});

export { Brand, Series, Usage, Product };
