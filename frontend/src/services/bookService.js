import API from "./api"

export const getBooks = async (params = {}) => {
  const response = await API.get("/books", { params })
  return response.data
}

export const getBookById = async (id) => {
  const response = await API.get(`/books/${id}`)
  return response.data
}

export const createBook = async (bookData) => {
  const formData = new FormData()

  // Append text fields
  Object.keys(bookData).forEach((key) => {
    if (key !== "coverImage" && key !== "additionalImages") {
      if (Array.isArray(bookData[key])) {
        bookData[key].forEach((value) => formData.append(`${key}[]`, value))
      } else {
        formData.append(key, bookData[key])
      }
    }
  })

  // Append cover image if exists
  if (bookData.coverImage) {
    formData.append("coverImage", bookData.coverImage)
  }

  const response = await API.post("/books", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export const updateBook = async (id, bookData) => {
  const formData = new FormData()

  // Append text fields
  Object.keys(bookData).forEach((key) => {
    if (key !== "coverImage" && key !== "additionalImages") {
      if (Array.isArray(bookData[key])) {
        bookData[key].forEach((value) => formData.append(`${key}[]`, value))
      } else {
        formData.append(key, bookData[key])
      }
    }
  })

  // Append cover image if exists
  if (bookData.coverImage && typeof bookData.coverImage !== "string") {
    formData.append("coverImage", bookData.coverImage)
  }

  const response = await API.put(`/books/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export const deleteBook = async (id) => {
  const response = await API.delete(`/books/${id}`)
  return response.data
}

export const addBookReview = async (id, reviewData) => {
  const response = await API.post(`/books/${id}/reviews`, reviewData)
  return response.data
}

export const updateInventory = async (id, inventoryData) => {
  const response = await API.put(`/books/${id}/inventory`, inventoryData)
  return response.data
}

export const uploadBookImages = async (id, images) => {
  const formData = new FormData()

  for (let i = 0; i < images.length; i++) {
    formData.append("images", images[i])
  }

  const response = await API.post(`/books/${id}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export const deleteBookImage = async (bookId, imageIndex) => {
  const response = await API.delete(`/books/${bookId}/images/${imageIndex}`)
  return response.data
}

