import Bid from "../models/Bid.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import Order from "../models/Order.js";

export const placeBid = async (req, res) => {
  try {
    const { productId } = req.params;
    let { amount } = req.body;

    // Ensure amount is a number
    amount = Number(amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Bid amount must be greater than 0",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        bannedUsers: { $nin: [userId] }, // ✅ FIXED
        currentBid: { $lt: amount },
        status: "active",
        auctionEndTime: { $gt: new Date() },
      },
      {
        $set: { currentBid: amount },
        $inc: { bidCount: 1 },
      },
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(400).json({
        message:
          "Bid failed. Either you are banned, auction ended, or bid too low.",
      });
    }

    // ✅ Create bid only after successful atomic update
    const bid = await Bid.create({
      product: productId,
      bidder: req.user._id,
      amount,
      status: "Pending",
    });

    res.status(201).json({
      message: "Bid placed successfully",
      bid,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate("product")
      .sort({ createdAt: -1 });

    // Get user's paid orders
    const paidOrders = await Order.find({
      user: req.user._id,
      paymentStatus: "Paid",
    });

    const bidsWithPaymentFlag = bids.map((bid) => {
      const isPaid = paidOrders.some(
        (order) => order.bid.toString() === bid._id.toString(),
      );

      return {
        ...bid._doc,
        isPaid,
      };
    });

    res.json(bidsWithPaymentFlag);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllBids = async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate("product", "title")
      .populate("bidder", "username email")
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateBidStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate("product");

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (bid.product.status !== "active") {
      return res.status(400).json({ message: "Auction already ended" });
    }

    bid.status = status;
    await bid.save();

    // If admin ACCEPTS bid
    if (status === "Accepted") {
      const product = await Product.findById(bid.product._id);

      product.currentBid = bid.amount;
      product.status = "ended"; // end auction
      await product.save();

      // Reject all other bids for same product
      await Bid.updateMany(
        { product: product._id, _id: { $ne: bid._id } },
        { status: "Rejected" },
      );
    }

    if (status === "Rejected") {
      await Product.findByIdAndUpdate(bid.product._id, {
        $addToSet: { bannedUsers: bid.bidder },
      });
    }

    res.json({ message: "Bid updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
