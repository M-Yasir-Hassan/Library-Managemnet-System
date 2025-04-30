import express from "express"
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyToken,
} from "../controllers/auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/verify", verifyToken)

// Protected routes
router.get("/profile", protect, getUserProfile)
router.put("/profile", protect, updateUserProfile)

export default router