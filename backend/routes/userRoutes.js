import express from "express";
import {
  getProfile,
  updateProfile,
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profilePic"), updateProfile);

// Admin routes
router.post("/", protect, authorize("admin"), createUserByAdmin);
router.get("/", protect, authorize('admin'), getAllUsers);
router.put("/:id", protect, authorize('admin'), updateUserByAdmin);
router.delete("/:id", protect, authorize('admin'), deleteUserByAdmin);

export default router;
