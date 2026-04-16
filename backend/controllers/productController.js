import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      listingType,
      startingBid,
      auctionEndTime,
      fixedPrice,
    } = req.body;
    const image = req.file ? (req.file.path || req.file.url) : null;

    if (!image)
      return res.status(400).json({ message: "Product image is required" });

    if (listingType === "auction") {
      if (!startingBid || !auctionEndTime)
        return res
          .status(400)
          .json({
            message:
              "Starting bid and auction end time are required for auction listings",
          });
    } else if (listingType === "fixed") {
      if (!fixedPrice || fixedPrice <= 0)
        return res
          .status(400)
          .json({
            message: "A valid fixed price is required for fixed-price listings",
          });
    }

    const isFixed = listingType === "fixed";

    const product = await Product.create({
      title,
      description,
      category,
      image,
      listingType: listingType || "auction",
      startingBid: isFixed ? null : startingBid,
      currentBid: isFixed ? null : startingBid,
      auctionEndTime: isFixed ? null : auctionEndTime,
      fixedPrice: isFixed ? fixedPrice : null,
      status: isFixed ? "pending_approval" : "active",
      createdBy: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startingBid,
      auctionEndTime,
      fixedPrice,
      status,
    } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;
    product.status = status || product.status;

    if (product.listingType === "auction") {
      product.startingBid = startingBid || product.startingBid;
      product.auctionEndTime = auctionEndTime || product.auctionEndTime;
    } else {
      product.fixedPrice = fixedPrice || product.fixedPrice;
    }

    if (req.file) product.image = req.file.path || req.file.url;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({
      listingType: "fixed",
      status: "pending_approval",
    })
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Approve — sets product live + creates notification for the seller
export const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.listingType !== "fixed")
      return res
        .status(400)
        .json({ message: "Only fixed-price listings need approval" });

    product.status = "active";
    await product.save();

    // Create notification for the seller
    await Notification.create({
      user: product.createdBy,
      productTitle: product.title,
      type: "approved",
    });

    res.json({ message: "Product approved and is now live", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Reject — marks rejected + creates notification for the seller
export const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.status = "rejected";
    await product.save();

    // Create notification for the seller
    await Notification.create({
      user: product.createdBy,
      productTitle: product.title,
      type: "rejected",
    });

    res.json({ message: "Product rejected", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
