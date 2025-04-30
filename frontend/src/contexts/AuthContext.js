"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { toast } from "react-toastify"
import * as authService from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true)
      const { success, user, token } = await authService.loginUser(credentials)

      if (success && token) {
        localStorage.setItem("token", token)
        setUser(user)
        setIsAuthenticated(true)
        toast.success("Login successful!")
        return { success: true }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      const { success, user, token } = await authService.registerUser(userData)

      if (success && token) {
        localStorage.setItem("token", token)
        setUser(user)
        setIsAuthenticated(true)
        toast.success("Registration successful!")
        return { success: true }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setUser(null)
    setIsAuthenticated(false)
    toast.info("You have been logged out")
  }, [])

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const { success, user } = await authService.verifyToken()

      if (success) {
        // Fetch user profile with stats
        const profileResponse = await authService.getUserProfile()
        if (profileResponse.success) {
          setUser(profileResponse.user)
        } else {
          setUser(user)
        }
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("token")
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      localStorage.removeItem("token")
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (userData) => {
    try {
      setLoading(true)
      const { success, user, token } = await authService.updateUserProfile(userData)

      if (success) {
        if (token) {
          localStorage.setItem("token", token)
        }
        // Preserve stats from previous user state
        setUser((prevUser) => ({
          ...user,
          stats: prevUser?.stats || {},
        }))
        toast.success("Profile updated successfully!")
        return { success: true }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyToken,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}