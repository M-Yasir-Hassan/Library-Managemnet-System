import API from "./api"

export const getCommunities = async (params = {}) => {
  const response = await API.get("/community", { params })
  return response.data
}

export const getCommunityById = async (id) => {
  const response = await API.get(`/community/${id}`)
  return response.data
}

export const createCommunity = async (communityData) => {
  const response = await API.post("/community", communityData)
  return response.data
}

export const updateCommunity = async (id, communityData) => {
  const response = await API.put(`/community/${id}`, communityData)
  return response.data
}

export const deleteCommunity = async (id) => {
  const response = await API.delete(`/community/${id}`)
  return response.data
}

export const joinCommunity = async (id) => {
  const response = await API.post(`/community/${id}/join`)
  return response.data
}

export const leaveCommunity = async (id) => {
  const response = await API.post(`/community/${id}/leave`)
  return response.data
}

export const updateMemberRole = async (communityId, userId, roleData) => {
  const response = await API.put(`/community/${communityId}/members/${userId}`, roleData)
  return response.data
}

export const getCommunityPosts = async (communityId, params = {}) => {
  const response = await API.get(`/community/${communityId}/posts`, { params })
  return response.data
}

export const createPost = async (communityId, postData) => {
  const response = await API.post(`/community/${communityId}/posts`, postData)
  return response.data
}

export const getCommunityMembers = async (communityId, params = {}) => {
  const response = await API.get(`/community/${communityId}/members`, { params })
  return response.data
}

export const getPostComments = async (postId, params = {}) => {
  const response = await API.get(`/posts/${postId}/comments`, { params })
  return response.data
}