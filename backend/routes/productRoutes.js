import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from "../controllers/productController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

// user route
router.post("/", protect, upload.single("image"), createProduct);

// admin routes
router.get("/admin/pending", protect, authorize("admin"), getPendingProducts);
router.patch("/:id/approve", protect, authorize("admin"), approveProduct);
router.patch("/:id/reject", protect, authorize("admin"), rejectProduct);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateProduct,
);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
