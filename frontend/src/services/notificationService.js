import API from "./api"

export const getNotifications = async (params = {}) => {
  const response = await API.get("/notifications", { params })
  return response.data
}

export const markNotificationAsRead = async (id) => {
  const response = await API.put(`/notifications/${id}/read`)
  return response.data
}

export const markAllNotificationsAsRead = async () => {
  const response = await API.put("/notifications/read-all")
  return response.data
}

export const deleteNotification = async (id) => {
  const response = await API.delete(`/notifications/${id}`)
  return response.data
}

export const deleteReadNotifications = async () => {
  const response = await API.delete("/notifications/read")
  return response.data
}

