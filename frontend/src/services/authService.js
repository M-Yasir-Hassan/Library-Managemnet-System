import API from "./api"

export const registerUser = async (userData) => {
  const response = await API.post("/auth/register", userData)
  return response.data
}

export const loginUser = async (credentials) => {
  const response = await API.post("/auth/login", credentials)
  return response.data
}

export const verifyToken = async () => {
  const response = await API.get("/auth/verify")
  return response.data
}

export const getUserProfile = async () => {
  const response = await API.get("/auth/profile?includeStats=true")
  return response.data
}

export const updateUserProfile = async (userData) => {
  const response = await API.put("/auth/profile", userData)
  return response.data
}