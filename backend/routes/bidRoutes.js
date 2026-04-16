import express from "express";
import {
  placeBid,
  getMyBids,
  getAllBids,
  updateBidStatus,
} from "../controllers/bidController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-bids", protect, getMyBids);
router.post("/:productId", protect, placeBid);

// Admin routes
router.get("/", protect, authorize("admin"), getAllBids);
router.put("/:bidId", protect, authorize("admin"), updateBidStatus);

export default router;
