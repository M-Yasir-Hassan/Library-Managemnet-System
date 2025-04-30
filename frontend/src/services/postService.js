import API from "./api"

export const getPostById = async (id) => {
  const response = await API.get(`/posts/${id}`)
  return response.data
}

export const updatePost = async (id, postData) => {
  const response = await API.put(`/posts/${id}`, postData)
  return response.data
}

export const deletePost = async (id) => {
  const response = await API.delete(`/posts/${id}`)
  return response.data
}

export const likePost = async (id) => {
  const response = await API.put(`/posts/${id}/like`)
  return response.data
}

export const addComment = async (id, commentData) => {
  const response = await API.post(`/posts/${id}/comments`, commentData)
  return response.data
}

export const updateComment = async (postId, commentId, commentData) => {
  const response = await API.put(`/posts/${postId}/comments/${commentId}`, commentData)
  return response.data
}

export const deleteComment = async (postId, commentId) => {
  const response = await API.delete(`/posts/${postId}/comments/${commentId}`)
  return response.data
}

export const reportPost = async (id, reportData) => {
  const response = await API.post(`/posts/${id}/report`, reportData)
  return response.data
}

