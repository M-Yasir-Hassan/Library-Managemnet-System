"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { toast } from "react-toastify"
import * as bookService from "../services/bookService"

const BookContext = createContext()

export const useBook = () => useContext(BookContext)

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([])
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  const getBooks = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const { success, books, page, pages, total } = await bookService.getBooks(params)

      if (success) {
        setBooks(books)
        setPagination({ page, pages, total })
      }
      return { success, books }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch books")
      toast.error(error.response?.data?.message || "Failed to fetch books")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const getBookById = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { success, book } = await bookService.getBookById(id)

      if (success) {
        setBook(book)
      }
      return { success, book }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch book details")
      toast.error(error.response?.data?.message || "Failed to fetch book details")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const createBook = useCallback(async (bookData) => {
    try {
      setLoading(true)
      setError(null)
      const { success, book } = await bookService.createBook(bookData)

      if (success) {
        toast.success("Book created successfully!")
      }
      return { success, book }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create book")
      toast.error(error.response?.data?.message || "Failed to create book")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateBook = useCallback(async (id, bookData) => {
    try {
      setLoading(true)
      setError(null)
      const { success, book } = await bookService.updateBook(id, bookData)

      if (success) {
        toast.success("Book updated successfully!")
      }
      return { success, book }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update book")
      toast.error(error.response?.data?.message || "Failed to update book")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteBook = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { success, message } = await bookService.deleteBook(id)

      if (success) {
        toast.success(message || "Book deleted successfully!")
      }
      return { success }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete book")
      toast.error(error.response?.data?.message || "Failed to delete book")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const addBookReview = useCallback(
    async (id, reviewData) => {
      try {
        setLoading(true)
        setError(null)
        const { success, message, review } = await bookService.addBookReview(id, reviewData)

        if (success) {
          toast.success(message || "Review added successfully!")
          // Update the book in state with the new review
          if (book && book._id === id) {
            setBook((prevBook) => ({
              ...prevBook,
              reviews: [...prevBook.reviews, review],
              rating:
                prevBook.reviews.length > 0
                  ? (prevBook.reviews.reduce((acc, item) => item.rating + acc, 0) + review.rating) /
                    (prevBook.reviews.length + 1)
                  : review.rating,
            }))
          }
        }
        return { success, review }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to add review")
        toast.error(error.response?.data?.message || "Failed to add review")
        return { success: false, error }
      } finally {
        setLoading(false)
      }
    },
    [book],
  )

  const updateInventory = useCallback(async (id, inventoryData) => {
    try {
      setLoading(true)
      setError(null)
      const { success, book } = await bookService.updateInventory(id, inventoryData)

      if (success) {
        toast.success("Inventory updated successfully!")
      }
      return { success, book }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update inventory")
      toast.error(error.response?.data?.message || "Failed to update inventory")
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    books,
    book,
    loading,
    error,
    pagination,
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    addBookReview,
    updateInventory,
  }

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>
}

