import API from "./api"

export const getUsers = async (params = {}) => {
  const response = await API.get("/users", { params })
  return response.data
}

export const getUserById = async (id) => {
  const response = await API.get(`/users/${id}`)
  return response.data
}

export const updateUser = async (id, userData) => {
  const response = await API.put(`/users/${id}`, userData)
  return response.data
}

export const deleteUser = async (id) => {
  const response = await API.delete(`/users/${id}`)
  return response.data
}

export const getUserStats = async () => {
  const response = await API.get("/users/stats")
  return response.data
}

export const getUserBorrowedBooks = async (params = {}) => {
  const response = await API.get("/users/borrowed-books", { params })
  return response.data
}

export const getUserPurchasedBooks = async (params = {}) => {
  const response = await API.get("/users/purchased-books", { params })
  return response.data
}

