import express from "express"
import {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  updateMemberRole,
} from "../controllers/community.controller.js"
import { getCommunityPosts, createPost } from "../controllers/post.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes are now protected
router.get("/", protect, getCommunities)
router.get("/:id", protect, getCommunityById)
router.post("/", protect, createCommunity)
router.put("/:id", protect, updateCommunity)
router.delete("/:id", protect, deleteCommunity)
router.post("/:id/join", protect, joinCommunity)
router.post("/:id/leave", protect, leaveCommunity)
router.put("/:id/members/:userId", protect, updateMemberRole)

// Post routes within community
router.get("/:communityId/posts", protect, getCommunityPosts)
router.post("/:communityId/posts", protect, createPost)

export default router

