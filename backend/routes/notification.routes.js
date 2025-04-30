import express from "express"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
} from "../controllers/notification.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protect, getUserNotifications)
router.put("/:id/read", protect, markNotificationAsRead)
router.put("/read-all", protect, markAllNotificationsAsRead)
router.delete("/:id", protect, deleteNotification)
router.delete("/read", protect, deleteReadNotifications)

export default router

