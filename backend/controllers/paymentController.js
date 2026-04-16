import crypto from "crypto";
import { razorpayInstance } from "../config/razorpay.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Bid from "../models/Bid.js";
import Product from "../models/Product.js";

export const buyNow = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);

    if (
      !product ||
      product.listingType !== "fixed" ||
      product.status !== "active"
    ) {
      return res
        .status(400)
        .json({ message: "Product not available for purchase" });
    }

    // Prevent duplicate unpaid orders
    const existingOrder = await Order.findOne({
      user: userId,
      product: productId,
      paymentStatus: "Pending",
    });

    const orderDoc =
      existingOrder ||
      (await Order.create({
        user: userId,
        product: productId,
        amount: product.fixedPrice,
      }));

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(product.fixedPrice * 100),
      currency: "INR",
      receipt: orderDoc.orderNumber,
    });

    await Payment.create({
      order: orderDoc._id,
      user: userId,
      razorpayOrderId: razorpayOrder.id,
      amount: product.fixedPrice,
    });

    res.status(200).json({
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { bidId } = req.body;
    const userId = req.user._id;

    const bid = await Bid.findById(bidId).populate("product");

    if (!bid || bid.status !== "Accepted") {
      return res.status(400).json({ message: "Invalid bid" });
    }

    if (bid.product.status !== "ended") {
      return res.status(400).json({ message: "Auction not ended" });
    }

    // ✅ CHECK IF ORDER ALREADY EXISTS
    let existingOrder = await Order.findOne({
      bid: bid._id,
      user: userId,
    });

    if (existingOrder && existingOrder.paymentStatus === "Paid") {
      return res.status(400).json({
        message: "Order already paid",
      });
    }

    let orderDoc;

    if (existingOrder) {
      orderDoc = existingOrder;
    } else {
      // Create new order only if not exists
      orderDoc = await Order.create({
        user: userId,
        product: bid.product._id,
        bid: bid._id,
        amount: bid.amount,
      });
    }

    // Create Razorpay Order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(bid.amount * 100),
      currency: "INR",
      receipt: orderDoc.orderNumber,
    });

    // Create Payment Record
    await Payment.create({
      order: orderDoc._id,
      user: userId,
      razorpayOrderId: razorpayOrder.id,
      amount: bid.amount,
    });

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
    });
  } catch (error) {
    res.status(500).json({ message: "Order creation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 1️⃣ Find payment
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // 2️⃣ Update payment
    payment.status = "Success";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // 3️⃣ Update order safely using findById
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";
      await order.save();
    }

    res.status(200).json({ message: "Payment verified" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};
