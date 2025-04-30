"use client"

import { useEffect } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { useAuth } from "./contexts/AuthContext"

// Layouts
import MainLayout from "./layouts/MainLayout"
import AdminLayout from "./layouts/AdminLayout"

// Public Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import BookDetailsPage from "./pages/books/BookDetailsPage"
import BooksPage from "./pages/books/BooksPage"

// Protected Pages
import ProfilePage from "./pages/user/ProfilePage"
import BorrowedBooksPage from "./pages/user/BorrowedBooksPage"
import PurchasedBooksPage from "./pages/user/PurchasedBooksPage"
import CommunitiesPage from "./pages/community/CommunitiesPage"
import CommunityDetailsPage from "./pages/community/CommunityDetailsPage"
import NotificationsPage from "./pages/user/NotificationsPage"

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"
import AdminBooksPage from "./pages/admin/AdminBooksPage"
import AdminUsersPage from "./pages/admin/AdminUsersPage"
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage"
import AdminCommunitiesPage from "./pages/admin/AdminCommunitiesPage"
import AddEditBookPage from "./pages/admin/AddEditBookPage"

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />
  }

  return children
}

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" />
  }

  return children
}

function App() {
  const { verifyToken } = useAuth()

  useEffect(() => {
    verifyToken()
  }, [verifyToken])

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="books/:id" element={<BookDetailsPage />} />

          {/* Protected Routes */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="borrowed-books"
            element={
              <ProtectedRoute>
                <BorrowedBooksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="purchased-books"
            element={
              <ProtectedRoute>
                <PurchasedBooksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="communities"
            element={
              <ProtectedRoute>
                <CommunitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="communities/:id"
            element={
              <ProtectedRoute>
                <CommunityDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="books" element={<AdminBooksPage />} />
          <Route path="books/add" element={<AddEditBookPage />} />
          <Route path="books/edit/:id" element={<AddEditBookPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="communities" element={<AdminCommunitiesPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App

