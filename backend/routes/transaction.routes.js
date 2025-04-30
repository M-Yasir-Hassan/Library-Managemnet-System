import express from "express"
import {
  getTransactions,
  getTransactionById,
  createBorrowTransaction,
  createReturnTransaction,
  createPurchaseTransaction,
  getUserTransactions,
} from "../controllers/transaction.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protect, admin, getTransactions)
router.get("/user", protect, getUserTransactions)
router.get("/:id", protect, getTransactionById)
router.post("/borrow", protect, createBorrowTransaction)
router.post("/return", protect, createReturnTransaction)
router.post("/purchase", protect, createPurchaseTransaction)

export default router

