import mongoose from "mongoose"

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    ISBN: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    additionalImages: [
      {
        type: String,
      },
    ],
    genre: [
      {
        type: String,
        required: true,
      },
    ],
    publicationYear: {
      type: Number,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 0,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    language: {
      type: String,
      required: true,
    },
    pageCount: {
      type: Number,
      required: true,
      min: 1,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isAvailableForPurchase: {
      type: Boolean,
      default: true,
    },
    isAvailableForBorrowing: {
      type: Boolean,
      default: true,
    },
    // Enhanced book details
    tableOfContents: [
      {
        title: String,
        page: Number,
      },
    ],
    summary: {
      type: String,
    },
    targetAudience: {
      type: String,
    },
    edition: {
      type: String,
    },
    dimensions: {
      type: String,
    },
    weight: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Add text index for search functionality
bookSchema.index({
  title: "text",
  author: "text",
  description: "text",
  genre: "text",
  publisher: "text",
  summary: "text",
  tags: "text",
})

const Book = mongoose.model("Book", bookSchema)

export default Book

