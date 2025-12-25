import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const {
      items = [],
      paymentMethod = "COD",
      recipientName,
      phone,
      city,
      district,
      street,
      shippingFee = 0,
      discount = 0,
      notes,
    } = req.body;

    if (!items.length) {
      return res.status(400).json({ success: false, message: "No items" });
    }

    // Build subtotal from current product prices
    let subtotal = 0;
    const preparedItems = [];
    for (const it of items) {
      const p = await Product.findByPk(it.productId);
      if (!p)
        return res.status(404).json({
          success: false,
          message: `Product ${it.productId} not found`,
        });
      const price = p.price; // using current price; could include sale logic
      const quantity = it.quantity ?? 1;
      subtotal += price * quantity;
      preparedItems.push({
        productId: p.id,
        name: p.name,
        price,
        quantity,
        thumbnail: p.thumbnail,
      });
    }

    const total = subtotal - discount + shippingFee;

    const order = await Order.create({
      userId: req.user.id,
      status: "pending",
      paymentMethod,
      recipientName,
      phone,
      city,
      district,
      street,
      subtotal,
      discount,
      shippingFee,
      total,
      notes,
    });

    // Create items
    for (const pi of preparedItems) {
      await OrderItem.create({ ...pi, orderId: order.id });
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem }],
    });

    res.status(201).json({ success: true, data: fullOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Create order error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      include: [{ model: OrderItem }],
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch orders error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, include: [Product] }],
    });
    if (!order)
      return res.status(404).json({ success: false, message: "Not found" });

    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch order error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [
      "pending",
      "confirmed",
      "shipping",
      "delivered",
      "cancelled",
    ];
    if (!allowed.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });

    const order = await Order.findByPk(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Not found" });

    order.status = status;
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update status error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Not found" });
    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (order.status === "delivered" || order.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be cancelled" });
    }
    order.status = "cancelled";
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cancel order error" });
  }
};
