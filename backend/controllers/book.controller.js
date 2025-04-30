import Book from "../models/book.model.js"
import fs from "fs"
import path from "path"

// Helper function to delete file
const deleteFile = (filePath) => {
  // Make sure the file path is relative to the server root
  const absolutePath = path.resolve(filePath)
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath)
  }
}

// @desc    Get all books with pagination and filters
// @route   GET /api/books
// @access  Private (now protected)
export const getBooks = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10
    const page = Number(req.query.page) || 1

    // Build filter object
    const filter = {}

    if (req.query.genre) {
      filter.genre = { $in: req.query.genre.split(",") }
    }

    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: "i" }
    }

    if (req.query.year) {
      filter.publicationYear = Number(req.query.year)
    }

    if (req.query.language) {
      filter.language = req.query.language
    }

    if (req.query.available === "true") {
      filter.availableCopies = { $gt: 0 }
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search }
    }

    // Build sort object
    let sort = {}
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith("-") ? req.query.sort.substring(1) : req.query.sort
      const sortOrder = req.query.sort.startsWith("-") ? -1 : 1
      sort[sortField] = sortOrder
    } else {
      sort = { createdAt: -1 }
    }

    const count = await Book.countDocuments(filter)

    const books = await Book.find(filter)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1))

    res.json({
      success: true,
      books,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Private (now protected)
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (book) {
      res.json({
        success: true,
        book,
      })
    } else {
      res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      ISBN,
      description,
      genre,
      publicationYear,
      publisher,
      totalCopies,
      price,
      language,
      pageCount,
      isAvailableForPurchase,
      isAvailableForBorrowing,
      tableOfContents,
      summary,
      targetAudience,
      edition,
      dimensions,
      weight,
    } = req.body

    // Check if book with ISBN already exists
    const bookExists = await Book.findOne({ ISBN })

    if (bookExists) {
      // If a file was uploaded, delete it since we won't be creating a book
      if (req.file) {
        deleteFile(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      })
    }

    // Get cover image path from the uploaded file
    let coverImage = ""
    if (req.file) {
      // Store the relative path to the file
      coverImage = req.file.path
    }

    // Create book with enhanced details
    const book = new Book({
      title,
      author,
      ISBN,
      description,
      coverImage,
      genre: Array.isArray(genre) ? genre : [genre],
      publicationYear,
      publisher,
      totalCopies,
      availableCopies: totalCopies, // Initially all copies are available
      price,
      language,
      pageCount,
      isAvailableForPurchase,
      isAvailableForBorrowing,
      // Enhanced book details
      tableOfContents: tableOfContents || [],
      summary: summary || "",
      targetAudience: targetAudience || "",
      edition: edition || "",
      dimensions: dimensions || "",
      weight: weight || "",
    })

    const createdBook = await book.save()

    res.status(201).json({
      success: true,
      book: createdBook,
    })
  } catch (error) {
    console.error(error)
    // If an error occurs, delete the uploaded file if it exists
    if (req.file) {
      deleteFile(req.file.path)
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      // If a file was uploaded, delete it since the book doesn't exist
      if (req.file) {
        deleteFile(req.file.path)
      }

      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Handle cover image update
    if (req.file) {
      // If there's an existing image, delete it
      if (book.coverImage) {
        deleteFile(book.coverImage)
      }

      // Set the new cover image path
      book.coverImage = req.file.path
    }

    // Update book fields
    const fieldsToUpdate = [
      "title",
      "author",
      "ISBN",
      "description",
      "genre",
      "publicationYear",
      "publisher",
      "price",
      "language",
      "pageCount",
      "isAvailableForPurchase",
      "isAvailableForBorrowing",
      "tableOfContents",
      "summary",
      "targetAudience",
      "edition",
      "dimensions",
      "weight",
    ]

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Special handling for genre to ensure it's always an array
        if (field === "genre") {
          book[field] = Array.isArray(req.body[field]) ? req.body[field] : [req.body[field]]
        } else if (field === "totalCopies") {
          // Update available copies based on the change in total copies
          const diff = req.body.totalCopies - book.totalCopies
          book.totalCopies = req.body.totalCopies
          book.availableCopies = Math.max(0, book.availableCopies + diff)
        } else {
          book[field] = req.body[field]
        }
      }
    })

    const updatedBook = await book.save()

    res.json({
      success: true,
      book: updatedBook,
    })
  } catch (error) {
    console.error(error)
    // If an error occurs, delete the uploaded file if it exists
    if (req.file) {
      deleteFile(req.file.path)
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Delete cover image if it exists
    if (book.coverImage) {
      deleteFile(book.coverImage)
    }

    // Delete additional images if they exist
    if (book.additionalImages && book.additionalImages.length > 0) {
      book.additionalImages.forEach((imagePath) => {
        deleteFile(imagePath)
      })
    }

    await book.deleteOne()

    res.json({
      success: true,
      message: "Book removed",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Add a review to a book
// @route   POST /api/books/:id/reviews
// @access  Private
export const addBookReview = async (req, res) => {
  try {
    const { rating, comment } = req.body

    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Check if user already reviewed this book
    const alreadyReviewed = book.reviews.find((review) => review.user.toString() === req.user._id.toString())

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "Book already reviewed",
      })
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
    }

    book.reviews.push(review)

    // Update book rating
    book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length

    await book.save()

    res.status(201).json({
      success: true,
      message: "Review added",
      review,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Update inventory (real-time tracking)
// @route   PUT /api/books/:id/inventory
// @access  Private/Admin
export const updateInventory = async (req, res) => {
  try {
    const { operation, quantity } = req.body

    if (!["add", "remove"].includes(operation) || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid operation or quantity",
      })
    }

    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    if (operation === "add") {
      book.totalCopies += quantity
      book.availableCopies += quantity
    } else if (operation === "remove") {
      if (book.totalCopies < quantity) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove more copies than exist",
        })
      }

      book.totalCopies -= quantity
      book.availableCopies = Math.max(0, book.availableCopies - quantity)
    }

    const updatedBook = await book.save()

    res.json({
      success: true,
      book: updatedBook,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Upload book images (multiple)
// @route   POST /api/books/:id/images
// @access  Private/Admin
export const uploadBookImages = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      // Delete uploaded files since the book doesn't exist
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          deleteFile(file.path)
        })
      }

      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Handle multiple image uploads
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      })
    }

    // Get image paths from uploaded files
    const imagePaths = req.files.map((file) => file.path)

    // Add new images to the book's additional images array
    if (!book.additionalImages) {
      book.additionalImages = []
    }

    book.additionalImages = [...book.additionalImages, ...imagePaths]

    await book.save()

    res.status(201).json({
      success: true,
      images: book.additionalImages,
    })
  } catch (error) {
    console.error(error)
    // Delete uploaded files if an error occurs
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        deleteFile(file.path)
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Delete book image
// @route   DELETE /api/books/:id/images/:imageIndex
// @access  Private/Admin
export const deleteBookImage = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    const imageIndex = Number.parseInt(req.params.imageIndex)

    // Check if the image index is valid
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= book.additionalImages.length) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      })
    }

    // Get the image path
    const imagePath = book.additionalImages[imageIndex]

    // Delete the file
    deleteFile(imagePath)

    // Remove image from book's additional images
    book.additionalImages.splice(imageIndex, 1)

    await book.save()

    res.json({
      success: true,
      message: "Image removed",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}