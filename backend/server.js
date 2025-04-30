import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.routes.js"
import bookRoutes from "./routes/book.routes.js"
import userRoutes from "./routes/user.routes.js"
import transactionRoutes from "./routes/transaction.routes.js"
import communityRoutes from "./routes/community.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import postRoutes from "./routes/post.routes.js"

// Load environment variables
dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)
app.use("/api/users", userRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/community", communityRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/posts", postRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})