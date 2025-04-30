import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    type: {
      type: String,
      enum: ["borrow", "return", "purchase"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      // Required only for borrow transactions
    },
    returnDate: {
      type: Date,
      // Only for return transactions
    },
    amount: {
      type: Number,
      // Only for purchase transactions
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "overdue"],
      default: "pending",
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      // Only for purchase transactions
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

const Transaction = mongoose.model("Transaction", transactionSchema)

export default Transaction

