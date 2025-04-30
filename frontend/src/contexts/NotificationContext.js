"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { toast } from "react-toastify"
import * as notificationService from "../services/notificationService"
import { useAuth } from "./AuthContext"

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  const { isAuthenticated } = useAuth()

  const getNotifications = useCallback(
    async (params = {}) => {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        setError(null)
        const { success, notifications, page, pages, total, unreadCount } =
          await notificationService.getNotifications(params)

        if (success) {
          setNotifications(notifications)
          setPagination({ page, pages, total })
          setUnreadCount(unreadCount)
        }
        return { success, notifications }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch notifications")
        return { success: false, error }
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated],
  )

  const markAsRead = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { success, notification } = await notificationService.markNotificationAsRead(id)

      if (success) {
        // Update the notification in state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif)),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
      return { success, notification }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to mark notification as read")
      toast.error(error.response?.data?.message || "Failed to mark notification as read")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { success, message } = await notificationService.markAllNotificationsAsRead()

      if (success) {
        // Update all notifications in state
        setNotifications((prevNotifications) => prevNotifications.map((notif) => ({ ...notif, isRead: true })))
        setUnreadCount(0)
        toast.success(message || "All notifications marked as read")
      }
      return { success }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to mark all notifications as read")
      toast.error(error.response?.data?.message || "Failed to mark all notifications as read")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteNotification = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { success, message } = await notificationService.deleteNotification(id)

      if (success) {
        // Remove the notification from state
        setNotifications((prevNotifications) => prevNotifications.filter((notif) => notif._id !== id))
        toast.success(message || "Notification deleted")
      }
      return { success }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete notification")
      toast.error(error.response?.data?.message || "Failed to delete notification")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteReadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { success, message } = await notificationService.deleteReadNotifications()

      if (success) {
        // Remove read notifications from state
        setNotifications((prevNotifications) => prevNotifications.filter((notif) => !notif.isRead))
        toast.success(message || "Read notifications deleted")
      }
      return { success }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete read notifications")
      toast.error(error.response?.data?.message || "Failed to delete read notifications")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getNotifications()
    }
  }, [isAuthenticated, getNotifications])

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

