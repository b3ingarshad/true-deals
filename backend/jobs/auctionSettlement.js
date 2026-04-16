import Bid from "../models/Bid.js";
import Product from "../models/Product.js";

export const settleExpiredAuctions = async () => {
  const expiredProducts = await Product.find({
    status: "active",
    auctionEndTime: { $lt: new Date() },
  });

  for (const product of expiredProducts) {
    const lockedProduct = await Product.findOneAndUpdate(
      { _id: product._id, status: "active" },
      { status: "processing" },
      { new: true },
    );

    if (!lockedProduct) continue;

    const highestBid = await Bid.findOne({ product: product._id }).sort({
      amount: -1,
      createdAt: 1,
    });

    if (highestBid) {
      await Bid.updateMany({ product: product._id }, [
        {
          $set: {
            status: {
              $cond: [
                { $eq: ["$_id", highestBid._id] },
                "Accepted",
                "Rejected",
              ],
            },
          },
        },
      ]);
    }

    lockedProduct.status = "ended";
    await lockedProduct.save();
  }
};
