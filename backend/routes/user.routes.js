import express from "express"
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getUserBorrowedBooks,
  getUserPurchasedBooks,
} from "../controllers/user.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protect, admin, getUsers)
router.get("/stats", protect, admin, getUserStats)
router.get("/borrowed-books", protect, getUserBorrowedBooks)
router.get("/purchased-books", protect, getUserPurchasedBooks)
router.get("/:id", protect, admin, getUserById)
router.put("/:id", protect, admin, updateUser)
router.delete("/:id", protect, admin, deleteUser)

export default router

