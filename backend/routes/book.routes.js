import express from "express"
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addBookReview,
  updateInventory,
  uploadBookImages,
  deleteBookImage,
} from "../controllers/book.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"
import upload from "../utils/imageUpload.js"

const router = express.Router()

// All routes are now protected
router.get("/", protect, getBooks)
router.get("/:id", protect, getBookById)
router.post("/", protect, admin, upload.single("coverImage"), createBook)
router.put("/:id", protect, admin, upload.single("coverImage"), updateBook)
router.delete("/:id", protect, admin, deleteBook)
router.post("/:id/reviews", protect, addBookReview)
router.put("/:id/inventory", protect, admin, updateInventory)
router.post("/:id/images", protect, admin, upload.array("images", 5), uploadBookImages)
router.delete("/:id/images/:imageIndex", protect, admin, deleteBookImage)

export default router