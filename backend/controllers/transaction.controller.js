import Transaction from "../models/transaction.model.js"
import Book from "../models/book.model.js"
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"

// @desc    Get all transactions with pagination and filters
// @route   GET /api/transactions
// @access  Private/Admin
export const getTransactions = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10
    const page = Number(req.query.page) || 1

    // Build filter object
    const filter = {}

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.user) {
      filter.user = req.query.user
    }

    if (req.query.book) {
      filter.book = req.query.book
    }

    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      }
    }

    // Build sort object
    let sort = {}
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith("-") ? req.query.sort.substring(1) : req.query.sort
      const sortOrder = req.query.sort.startsWith("-") ? -1 : 1
      sort[sortField] = sortOrder
    } else {
      sort = { date: -1 }
    }

    const count = await Transaction.countDocuments(filter)

    const transactions = await Transaction.find(filter)
      .populate("user", "name email")
      .populate("book", "title author ISBN")
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1))

    res.json({
      success: true,
      transactions,
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

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("user", "name email")
      .populate("book", "title author ISBN coverImage")

    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Check if user is admin or the transaction belongs to the user
    if (req.user.role !== "admin" && transaction.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this transaction",
      })
    }

    res.json({
      success: true,
      transaction,
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

// @desc    Create a borrow transaction
// @route   POST /api/transactions/borrow
// @access  Private
export const createBorrowTransaction = async (req, res) => {
  try {
    const { bookId, dueDate } = req.body

    // Check if book exists and is available for borrowing
    const book = await Book.findById(bookId)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    if (!book.isAvailableForBorrowing) {
      return res.status(400).json({
        success: false,
        message: "Book is not available for borrowing",
      })
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: "No copies available for borrowing",
      })
    }

    // Check if user already has this book borrowed
    const user = await User.findById(req.user._id)
    const alreadyBorrowed = user.borrowedBooks.find(
      (item) => item.book.toString() === bookId && item.status === "borrowed",
    )

    if (alreadyBorrowed) {
      return res.status(400).json({
        success: false,
        message: "You have already borrowed this book",
      })
    }

    // Create transaction
    const transaction = new Transaction({
      user: req.user._id,
      book: bookId,
      type: "borrow",
      dueDate: new Date(dueDate),
      status: "completed",
    })

    // Update book available copies
    book.availableCopies -= 1
    await book.save()

    // Update user's borrowed books
    user.borrowedBooks.push({
      book: bookId,
      dueDate: new Date(dueDate),
      status: "borrowed",
    })
    await user.save()

    // Save transaction
    const createdTransaction = await transaction.save()

    // Create notification
    await Notification.create({
      recipient: req.user._id,
      type: "transaction_complete",
      title: "Book Borrowed Successfully",
      message: `You have successfully borrowed "${book.title}". Please return it by ${new Date(dueDate).toLocaleDateString()}.`,
      relatedTo: {
        model: "Book",
        id: book._id,
      },
    })

    res.status(201).json({
      success: true,
      transaction: createdTransaction,
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

// @desc    Create a return transaction
// @route   POST /api/transactions/return
// @access  Private
export const createReturnTransaction = async (req, res) => {
  try {
    const { bookId } = req.body

    // Check if book exists
    const book = await Book.findById(bookId)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Check if user has borrowed this book
    const user = await User.findById(req.user._id)
    const borrowedBookIndex = user.borrowedBooks.findIndex(
      (item) => item.book.toString() === bookId && item.status === "borrowed",
    )

    if (borrowedBookIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You have not borrowed this book",
      })
    }

    const borrowedBook = user.borrowedBooks[borrowedBookIndex]

    // Calculate fine if overdue
    let fineAmount = 0
    const today = new Date()
    if (today > borrowedBook.dueDate) {
      const daysOverdue = Math.ceil((today - borrowedBook.dueDate) / (1000 * 60 * 60 * 24))
      fineAmount = daysOverdue * 1 // $1 per day overdue
    }

    // Create transaction
    const transaction = new Transaction({
      user: req.user._id,
      book: bookId,
      type: "return",
      returnDate: today,
      status: "completed",
      fineAmount,
    })

    // Update book available copies
    book.availableCopies += 1
    await book.save()

    // Update user's borrowed books
    user.borrowedBooks[borrowedBookIndex].status = "returned"
    user.borrowedBooks[borrowedBookIndex].returnDate = today
    await user.save()

    // Save transaction
    const createdTransaction = await transaction.save()

    // Create notification
    await Notification.create({
      recipient: req.user._id,
      type: "transaction_complete",
      title: "Book Returned Successfully",
      message:
        fineAmount > 0
          ? `You have successfully returned "${book.title}". A fine of $${fineAmount} has been applied for late return.`
          : `You have successfully returned "${book.title}". Thank you for returning it on time!`,
      relatedTo: {
        model: "Book",
        id: book._id,
      },
    })

    res.status(201).json({
      success: true,
      transaction: createdTransaction,
      fineAmount,
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

// @desc    Create a purchase transaction
// @route   POST /api/transactions/purchase
// @access  Private
export const createPurchaseTransaction = async (req, res) => {
  try {
    const { bookId, paymentMethod } = req.body

    // Check if book exists and is available for purchase
    const book = await Book.findById(bookId)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    if (!book.isAvailableForPurchase) {
      return res.status(400).json({
        success: false,
        message: "Book is not available for purchase",
      })
    }

    // Create transaction
    const transaction = new Transaction({
      user: req.user._id,
      book: bookId,
      type: "purchase",
      amount: book.price,
      paymentMethod,
      paymentStatus: "completed",
      status: "completed",
    })

    // Update user's purchased books
    const user = await User.findById(req.user._id)
    user.purchasedBooks.push({
      book: bookId,
      purchaseDate: new Date(),
    })
    await user.save()

    // Save transaction
    const createdTransaction = await transaction.save()

    // Create notification
    await Notification.create({
      recipient: req.user._id,
      type: "transaction_complete",
      title: "Book Purchased Successfully",
      message: `You have successfully purchased "${book.title}". Enjoy reading!`,
      relatedTo: {
        model: "Book",
        id: book._id,
      },
    })

    res.status(201).json({
      success: true,
      transaction: createdTransaction,
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

// @desc    Get user's transaction history
// @route   GET /api/transactions/user
// @access  Private
export const getUserTransactions = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10
    const page = Number(req.query.page) || 1

    // Build filter object
    const filter = { user: req.user._id }

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.status) {
      filter.status = req.query.status
    }

    const count = await Transaction.countDocuments(filter)

    const transactions = await Transaction.find(filter)
      .populate("book", "title author ISBN coverImage")
      .sort({ date: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))

    res.json({
      success: true,
      transactions,
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

