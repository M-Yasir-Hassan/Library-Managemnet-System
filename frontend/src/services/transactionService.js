import API from "./api"

export const getTransactions = async (params = {}) => {
  const response = await API.get("/transactions", { params })
  return response.data
}

export const getTransactionById = async (id) => {
  const response = await API.get(`/transactions/${id}`)
  return response.data
}

export const getUserTransactions = async (params = {}) => {
  const response = await API.get("/transactions/user", { params })
  return response.data
}

export const borrowBook = async (transactionData) => {
  const response = await API.post("/transactions/borrow", transactionData)
  return response.data
}

export const returnBook = async (transactionData) => {
  const response = await API.post("/transactions/return", transactionData)
  return response.data
}

export const purchaseBook = async (transactionData) => {
  const response = await API.post("/transactions/purchase", transactionData)
  return response.data
}

