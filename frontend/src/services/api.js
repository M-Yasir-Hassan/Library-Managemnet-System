import axios from "axios"

const API = axios.create({
  baseURL: "/api",
})

// Add a request interceptor to add the auth token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for authenticated routes that return 401
    if (error.response && error.response.status === 401) {
      const publicRoutes = ["/api/books", "/api/auth/login", "/api/auth/register"]
      const isPublicRoute = publicRoutes.some((route) => error.config.url.startsWith(route))

      if (!isPublicRoute) {
        // Token expired or invalid for protected routes
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default API