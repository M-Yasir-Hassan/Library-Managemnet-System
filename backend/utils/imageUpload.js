import multer from "multer"
import path from "path"
import fs from "fs"

// Update the upload paths to reflect the new structure
// Create uploads directory if it doesn't exist
const uploadsDir = "../uploads"
const bookImagesDir = "../uploads/books"

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

if (!fs.existsSync(bookImagesDir)) {
  fs.mkdirSync(bookImagesDir)
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/books/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/
  const mimetype = filetypes.test(file.mimetype)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

  if (mimetype && extname) {
    return cb(null, true)
  }
  cb(new Error("Only image files are allowed!"))
}

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter,
})

export default upload

