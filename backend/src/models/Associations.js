import Brand from "./Brand.js";
import Series from "./Series.js";
import Usage from "./Usage.js";
import Product from "./Product.js";
import User from "./User.js";
import Comment from "./Comment.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

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

// User - Comment
User.hasMany(Comment, { foreignKey: "userId", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "userId" });

// Product - Comment
Product.hasMany(Comment, { foreignKey: "productId", onDelete: "CASCADE" });
Comment.belongsTo(Product, { foreignKey: "productId" });

export { Brand, Series, Usage, Product, User, Comment };

// User - Order
User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

// Order - OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Product - OrderItem
Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "SET NULL" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });
