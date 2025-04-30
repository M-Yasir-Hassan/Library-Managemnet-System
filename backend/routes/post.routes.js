import express from "express"
import {
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  updateComment,
  deleteComment,
  reportPost,
} from "../controllers/post.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes are now protected
router.get("/:id", protect, getPostById)
router.put("/:id", protect, updatePost)
router.delete("/:id", protect, deletePost)
router.put("/:id/like", protect, likePost)
router.post("/:id/comments", protect, addComment)
router.put("/:id/comments/:commentId", protect, updateComment)
router.delete("/:id/comments/:commentId", protect, deleteComment)
router.post("/:id/report", protect, reportPost)

export default router

