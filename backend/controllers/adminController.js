import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.find({ role: "user" }).countDocuments();

    const activeAuctions = await Product.countDocuments({
      status: "active",
    });

    const pendingOrders = await Order.countDocuments({
      orderStatus: "Processing",
    });

    const totalSalesAgg = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalSales = totalSalesAgg[0]?.total || 0;

    res.json({
      totalUsers,
      activeAuctions,
      pendingOrders,
      totalSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
