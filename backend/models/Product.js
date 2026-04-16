import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["electronics", "accessories", "fashion", "home", "art"],
    },

    image: {
      type: String,
      required: true,
    },

    startingBid: {
      type: Number,
      min: 0,
      default: null,
    },

    currentBid: {
      type: Number,
      default: function () {
        return this.startingBid;
      },
    },

    bidCount: {
      type: Number,
      default: 0,
    },

    auctionEndTime: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "ended", "processing", "pending_approval", "rejected"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bannedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    listingType: {
      type: String,
      enum: ["auction", "fixed"],
      default: "auction",
    },

    fixedPrice: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
