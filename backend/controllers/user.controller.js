import User from "../models/user.model.js"
import Transaction from "../models/transaction.model.js"

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10
    const page = Number(req.query.page) || 1

    // Build filter object
    const filter = {}

    if (req.query.role) {
      filter.role = req.query.role
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ]
    }

    const count = await User.countDocuments(filter)

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))

    res.json({
      success: true,
      users,
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

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("borrowedBooks.book", "title author ISBN coverImage")
      .populate("purchasedBooks.book", "title author ISBN coverImage")
      .populate("joinedCommunities", "name description type")

    if (user) {
      res.json({
        success: true,
        user,
      })
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
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

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.role = req.body.role || user.role

      const updatedUser = await user.save()

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      })
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
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

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      // Check if user has any active borrows
      const hasActiveBorrows = user.borrowedBooks.some((book) => book.status === "borrowed")

      if (hasActiveBorrows) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete user with active borrowed books",
        })
      }

      await user.deleteOne()

      res.json({
        success: true,
        message: "User removed",
      })
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
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

// @desc    Get user's borrowed books
// @route   GET /api/users/borrowed-books
// @access  Private
export const getUserBorrowedBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "borrowedBooks.book",
      "title author ISBN coverImage description",
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Filter by status if provided
    let borrowedBooks = user.borrowedBooks
    if (req.query.status) {
      borrowedBooks = borrowedBooks.filter((book) => book.status === req.query.status)
    }

    res.json({
      success: true,
      borrowedBooks,
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

// @desc    Get user's purchased books
// @route   GET /api/users/purchased-books
// @access  Private
export const getUserPurchasedBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "purchasedBooks.book",
      "title author ISBN coverImage description",
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      purchasedBooks: user.purchasedBooks,
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

// @desc    Get user statistics (admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments()

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ])

    // New users in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Most active users (by transaction count)
    const mostActiveUsers = await Transaction.aggregate([
      {
        $group: {
          _id: "$user",
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: { transactionCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          transactionCount: 1,
        },
      },
    ])

    res.json({
      success: true,
      stats: {
        totalUsers,
        usersByRole,
        newUsers,
        mostActiveUsers,
      },
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

