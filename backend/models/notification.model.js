import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "book_due",
      "book_overdue",
      "book_available",
      "transaction_complete",
      "new_post",
      "new_comment",
      "mention",
      "like",
      "community_invite",
      "system",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedTo: {
    model: {
      type: String,
      enum: ["Book", "Transaction", "Community", "Post", "User"],
      required: true,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification

