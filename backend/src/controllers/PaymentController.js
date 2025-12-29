import { VNPay } from "vnpay";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/Order.js";

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE || "123",
  secureSecret: process.env.VNP_SECURE_SECRET || "123",
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  enableLog: true,
});

// Tạo URL thanh toán VNPAY
export const createPaymentUrl = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Kiểm quyền - user chỉ có thể thanh toán đơn hàng của mình
    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Tạo TxnRef duy nhất và lưu vào DB
    const txnRef = `${orderId}-${Date.now()}`;
    await order.update({
      paymentRef: txnRef,
    });

    const vnpUrl = vnpay.buildPaymentUrl({
      vnp_Amount: order.total, // VNPay library tự nhân với 100
      vnp_IpAddr: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: "other",
      vnp_ReturnUrl: `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/payment/callback`,
      vnp_Locale: "vn",
    });

    res.json({ success: true, data: { paymentUrl: vnpUrl } });
  } catch (err) {
    console.error("Create payment URL error:", err);
    res
      .status(500)
      .json({ success: false, message: "Create payment URL error" });
  }
};

// Xử lý callback từ VNPAY
export const handlePaymentCallback = async (req, res) => {
  try {
    const vnpParams = req.query;

    // Verify signature
    const isValid = vnpay.verifyReturnUrl(vnpParams);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const vnp_TransactionStatus = vnpParams.vnp_TransactionStatus;
    const vnp_TxnRef = vnpParams.vnp_TxnRef;
    const vnp_Amount = vnpParams.vnp_Amount;

    // Lấy orderId từ TxnRef
    const orderId = vnp_TxnRef.split("-")[0];

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (vnp_TransactionStatus === "00") {
      // Giao dịch thành công
      await order.update({
        status: "Thanh toán thành công",
        paymentStatus: "completed",
        transactionId: vnpParams.vnp_TransactionNo,
      });

      return res.json({
        success: true,
        message: "Payment successful",
        data: { orderId },
      });
    } else {
      // Giao dịch thất bại
      await order.update({
        status: "Thanh toán thất bại",
        paymentStatus: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Payment failed",
        data: { orderId },
      });
    }
  } catch (err) {
    console.error("Payment callback error:", err);
    res
      .status(500)
      .json({ success: false, message: "Callback processing error" });
  }
};

// IPN từ VNPAY (khác callback - đây là server-to-server)
export const handlePaymentIPN = async (req, res) => {
  try {
    const vnpParams = req.query;

    // Verify signature
    const isValid = vnpay.verifyIPN(vnpParams);
    if (!isValid) {
      return res.json({ RspCode: "97", Message: "Invalid signature" });
    }

    const vnp_TransactionStatus = vnpParams.vnp_TransactionStatus;
    const vnp_TxnRef = vnpParams.vnp_TxnRef;

    const orderId = vnp_TxnRef.split("-")[0];
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.json({ RspCode: "01", Message: "Order not found" });
    }

    if (vnp_TransactionStatus === "00") {
      await order.update({
        status: "Thanh toán thành công",
        paymentStatus: "completed",
        transactionId: vnpParams.vnp_TransactionNo,
      });
      return res.json({ RspCode: "00", Message: "Confirm success" });
    } else {
      await order.update({
        status: "Thanh toán thất bại",
        paymentStatus: "failed",
      });
      return res.json({ RspCode: "00", Message: "Confirm success" });
    }
  } catch (err) {
    console.error("Payment IPN error:", err);
    res.json({ RspCode: "99", Message: "Internal error" });
  }
};
