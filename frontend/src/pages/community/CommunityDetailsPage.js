"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, Button, Tabs, Tab, Form, Badge, ListGroup, Modal } from "react-bootstrap"
import {
  FaUsers,
  FaUserPlus,
  FaUserMinus,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLock,
  FaUnlock,
  FaHeart,
  FaComment,
} from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import {
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getCommunityPosts,
  createPost,
  updateMemberRole,
  getCommunityMembers,
} from "../../services/communityService"
import { likePost, addComment, deletePost, updatePost } from "../../services/postService"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import moment from "moment"

const CommunityDetailsPage = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [postLoading, setPostLoading] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [membersPagination, setMembersPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [membersPage, setMembersPage] = useState(1)
  const [activeTab, setActiveTab] = useState("posts")
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
  })
  const [commentForm, setCommentForm] = useState({
    content: "",
  })
  const [editPostForm, setEditPostForm] = useState({
    title: "",
    content: "",
  })
  const [selectedPost, setSelectedPost] = useState(null)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditPostModal, setShowEditPostModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedRole, setSelectedRole] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [isEditingPost, setIsEditingPost] = useState(false)

  useEffect(() => {
    fetchCommunityDetails()
  }, [id])

  useEffect(() => {
    if (community && activeTab === "posts") {
      fetchCommunityPosts()
    }
  }, [community, currentPage, activeTab])

  useEffect(() => {
    if (community && activeTab === "members") {
      fetchCommunityMembers()
    }
  }, [community, membersPage, activeTab])

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true)
      const response = await getCommunityById(id)
      if (response.success) {
        setCommunity(response.community)
      }
    } catch (error) {
      toast.error("Failed to fetch community details")
      console.error("Error fetching community details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityPosts = async () => {
    try {
      setPostLoading(true)
      const params = {
        page: currentPage,
      }
      const response = await getCommunityPosts(id, params)
      if (response.success) {
        setPosts(response.posts)
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total,
        })
      }
    } catch (error) {
      toast.error("Failed to fetch community posts")
      console.error("Error fetching community posts:", error)
    } finally {
      setPostLoading(false)
    }
  }

  const fetchCommunityMembers = async () => {
    try {
      setMembersLoading(true)
      const params = {
        page: membersPage,
      }
      const response = await getCommunityMembers(id, params)
      if (response.success) {
        setMembers(response.members)
        setMembersPagination({
          page: response.page,
          pages: response.pages,
          total: response.total,
        })
      }
    } catch (error) {
      toast.error("Failed to fetch community members")
      console.error("Error fetching community members:", error)
    } finally {
      setMembersLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleMembersPageChange = (page) => {
    setMembersPage(page)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handlePostFormChange = (e) => {
    const { name, value } = e.target
    setPostForm({
      ...postForm,
      [name]: value,
    })
  }

  const handleEditPostFormChange = (e) => {
    const { name, value } = e.target
    setEditPostForm({
      ...editPostForm,
      [name]: value,
    })
  }

  const handleCommentFormChange = (e) => {
    const { name, value } = e.target
    setCommentForm({
      ...commentForm,
      [name]: value,
    })
  }

  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to join communities")
      return
    }

    try {
      setIsJoining(true)
      const result = await joinCommunity(id)
      if (result.success) {
        toast.success("Successfully joined the community")
        fetchCommunityDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join community")
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeaveCommunity = async () => {
    try {
      setIsLeaving(true)
      const result = await leaveCommunity(id)
      if (result.success) {
        toast.success("Successfully left the community")
        fetchCommunityDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave community")
    } finally {
      setIsLeaving(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please login to create posts")
      return
    }

    try {
      setIsSubmittingPost(true)
      const result = await createPost(id, postForm)
      if (result.success) {
        toast.success("Post created successfully")
        setPostForm({
          title: "",
          content: "",
        })
        fetchCommunityPosts()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post")
    } finally {
      setIsSubmittingPost(false)
    }
  }

  const handleEditPost = async (e) => {
    e.preventDefault()

    if (!selectedPost) return

    try {
      setIsEditingPost(true)
      const result = await updatePost(selectedPost._id, editPostForm)
      if (result.success) {
        toast.success("Post updated successfully")
        setShowEditPostModal(false)
        // Update the post in the local state
        setPosts(posts.map((post) => (post._id === selectedPost._id ? { ...post, ...editPostForm } : post)))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update post")
    } finally {
      setIsEditingPost(false)
    }
  }

  const handleLikePost = async (postId) => {
    if (!isAuthenticated) {
      toast.error("Please login to like posts")
      return
    }

    try {
      const result = await likePost(postId)
      if (result.success) {
        // Update the post in the local state
        setPosts(posts.map((post) => (post._id === postId ? { ...post, likes: result.post.likes } : post)))
      }
    } catch (error) {
      toast.error("Failed to like post")
      console.error("Error liking post:", error)
    }
  }

  const handleCommentClick = (post) => {
    setSelectedPost(post)
    setCommentForm({ content: "" })
    setShowCommentModal(true)
  }

  const handleEditClick = (post) => {
    setSelectedPost(post)
    setEditPostForm({
      title: post.title,
      content: post.content,
    })
    setShowEditPostModal(true)
  }

  const handleAddComment = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please login to comment")
      return
    }

    try {
      setIsSubmittingComment(true)
      const result = await addComment(selectedPost._id, commentForm)
      if (result.success) {
        toast.success("Comment added successfully")
        setCommentForm({ content: "" })

        // Update the post in the local state with the new comment
        setPosts(
          posts.map((post) => {
            if (post._id === selectedPost._id) {
              return {
                ...post,
                comments: [...post.comments, result.comment],
              }
            }
            return post
          }),
        )

        // Close the modal after successful comment
        setShowCommentModal(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment")
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteClick = (post) => {
    setSelectedPost(post)
    setShowDeleteModal(true)
  }

  const handleDeletePost = async () => {
    try {
      const result = await deletePost(selectedPost._id)
      if (result.success) {
        toast.success("Post deleted successfully")
        setShowDeleteModal(false)

        // Remove the post from the local state
        setPosts(posts.filter((post) => post._id !== selectedPost._id))
      }
    } catch (error) {
      toast.error("Failed to delete post")
      console.error("Error deleting post:", error)
    }
  }

  const handleRoleClick = (member) => {
    setSelectedMember(member)
    setSelectedRole(member.role)
    setShowRoleModal(true)
  }

  const handleUpdateRole = async () => {
    try {
      setIsUpdatingRole(true)
      const result = await updateMemberRole(id, selectedMember.user._id, { role: selectedRole })
      if (result.success) {
        toast.success("Member role updated successfully")
        setShowRoleModal(false)
        fetchCommunityMembers()
      }
    } catch (error) {
      toast.error("Failed to update member role")
      console.error("Error updating member role:", error)
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const isUserMember = () => {
    if (!isAuthenticated || !community || !community.members) return false
    return community.members.some((member) => member.user._id === user._id)
  }

  const getUserRole = () => {
    if (!isAuthenticated || !community || !community.members) return null
    const member = community.members.find((member) => member.user._id === user._id)
    return member ? member.role : null
  }

  const isPostLikedByUser = (post) => {
    if (!isAuthenticated || !user) return false
    return post.likes.includes(user._id)
  }

  if (loading) return <Loader />

  if (!community) {
    return (
      <div className="text-center my-5">
        <h3>Community not found</h3>
        <Link to="/communities" className="btn btn-primary mt-3">
          Back to Communities
        </Link>
      </div>
    )
  }

  const userRole = getUserRole()
  const isAdmin = userRole === "admin"
  const isModerator = userRole === "moderator" || isAdmin

  return (
    <div>
      <Link to="/communities" className="btn btn-outline-secondary mb-4">
        &larr; Back to Communities
      </Link>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="mb-0">{community.name}</h1>
              <div className="d-flex align-items-center mt-2">
                <Badge bg="secondary" className="me-2">
                  {community.category}
                </Badge>
                <Badge bg="info" className="me-2">
                  {community.type
                    ? community.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
                    : "Discussion"}
                </Badge>
                {community.isPrivate ? (
                  <Badge bg="warning" className="d-flex align-items-center">
                    <FaLock className="me-1" /> Private
                  </Badge>
                ) : (
                  <Badge bg="success" className="d-flex align-items-center">
                    <FaUnlock className="me-1" /> Public
                  </Badge>
                )}
              </div>
            </div>
            <div>
              {isUserMember() ? (
                <Button variant="outline-danger" onClick={handleLeaveCommunity} disabled={isLeaving}>
                  <FaUserMinus className="me-2" />
                  {isLeaving ? "Leaving..." : "Leave Community"}
                </Button>
              ) : (
                <Button variant="primary" onClick={handleJoinCommunity} disabled={isJoining}>
                  <FaUserPlus className="me-2" />
                  {isJoining ? "Joining..." : "Join Community"}
                </Button>
              )}
            </div>
          </div>

          <p className="lead">{community.description}</p>

          <div className="d-flex align-items-center">
            <FaUsers className="text-primary me-2" />
            <span>{community.members?.length || community.memberCount || 0} members</span>
            <span className="mx-3">•</span>
            <span>Created {moment(community.createdAt).format("MMMM D, YYYY")}</span>
          </div>
        </Card.Body>
      </Card>

      <Tabs activeKey={activeTab} onSelect={handleTabChange} className="mb-4">
        <Tab eventKey="posts" title="Posts">
          {isUserMember() && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-3">Create a Post</h5>
                <Form onSubmit={handleCreatePost}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={postForm.title}
                      onChange={handlePostFormChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="content"
                      value={postForm.content}
                      onChange={handlePostFormChange}
                      required
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" disabled={isSubmittingPost}>
                      <FaPlus className="me-2" />
                      {isSubmittingPost ? "Posting..." : "Create Post"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {postLoading ? (
            <Loader />
          ) : (
            <>
              {posts.length === 0 ? (
                <Card>
                  <Card.Body className="text-center py-5">
                    <h4>No posts yet</h4>
                    {isUserMember() ? (
                      <p>Be the first to create a post in this community!</p>
                    ) : (
                      <p>Join this community to create posts and participate in discussions.</p>
                    )}
                  </Card.Body>
                </Card>
              ) : (
                <>
                  {posts.map((post) => (
                    <Card key={post._id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h4>{post.title}</h4>
                            <div className="text-muted mb-3">
                              Posted by {post.user?.name || "Unknown"} • {moment(post.createdAt).fromNow()}
                            </div>
                          </div>
                          {(post.user?._id === user?._id || isModerator) && (
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEditClick(post)}
                              >
                                <FaEdit />
                              </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(post)}>
                                <FaTrash />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p>{post.content}</p>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <Button
                              variant={isPostLikedByUser(post) ? "primary" : "outline-primary"}
                              size="sm"
                              className="me-2"
                              onClick={() => handleLikePost(post._id)}
                              disabled={!isAuthenticated}
                            >
                              <FaHeart className="me-1" /> {post.likes?.length || 0} Likes
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleCommentClick(post)}
                              disabled={!isAuthenticated}
                            >
                              <FaComment className="me-1" /> {post.comments?.length || 0} Comments
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}

                  {pagination.pages > 1 && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Tab>

        <Tab eventKey="members" title="Members">
          <Card>
            <Card.Body>
              <h5 className="mb-4">Community Members ({community.memberCount || community.members?.length || 0})</h5>

              {membersLoading ? (
                <Loader />
              ) : (
                <>
                  {members.length > 0 ? (
                    <ListGroup>
                      {members.map((member) => (
                        <ListGroup.Item key={member._id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6>{member.user?.name || "Unknown User"}</h6>
                            <small className="text-muted">
                              Joined {moment(member.joinedAt).format("MMMM D, YYYY")}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <Badge
                              bg={
                                member.role === "admin" ? "danger" : member.role === "moderator" ? "warning" : "primary"
                              }
                            >
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </Badge>

                            {isAdmin && member.user?._id !== user?._id && (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="ms-2"
                                onClick={() => handleRoleClick(member)}
                              >
                                <FaEdit />
                              </Button>
                            )}
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-center">No members found</p>
                  )}

                  {membersPagination.pages > 1 && (
                    <div className="mt-3">
                      <Pagination
                        currentPage={membersPagination.page}
                        totalPages={membersPagination.pages}
                        onPageChange={handleMembersPageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {isAdmin && (
          <Tab eventKey="settings" title="Settings">
            <Card>
              <Card.Body>
                <h5 className="mb-4">Community Settings</h5>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Community Name</Form.Label>
                    <Form.Control type="text" defaultValue={community.name} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} defaultValue={community.description} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select defaultValue={community.category}>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-fiction">Non-fiction</option>
                      <option value="Science">Science</option>
                      <option value="Technology">Technology</option>
                      <option value="History">History</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select defaultValue={community.type || "discussion"}>
                      <option value="discussion">Discussion</option>
                      <option value="book-club">Book Club</option>
                      <option value="study-group">Study Group</option>
                      <option value="author-fan">Author Fan Group</option>
                      <option value="genre-specific">Genre Specific</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check type="checkbox" label="Private Community" defaultChecked={community.isPrivate} />
                    <Form.Text className="text-muted">
                      Private communities require approval to join and are not visible to non-members.
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button variant="primary">Save Changes</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Tab>
        )}
      </Tabs>

      {/* Comment Modal */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Comment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddComment}>
          <Modal.Body>
            <p>
              <strong>{selectedPost?.title}</strong>
            </p>
            <Form.Group>
              <Form.Label>Your Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="content"
                value={commentForm.content}
                onChange={handleCommentFormChange}
                required
              />
            </Form.Group>

            {selectedPost?.comments?.length > 0 && (
              <div className="mt-4">
                <h6>Existing Comments</h6>
                <ListGroup variant="flush">
                  {selectedPost.comments.map((comment, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between">
                        <strong>{comment.user?.name || "Unknown"}</strong>
                        <small className="text-muted">{moment(comment.createdAt).fromNow()}</small>
                      </div>
                      <p className="mb-0 mt-1">{comment.content}</p>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmittingComment}>
              {isSubmittingComment ? "Submitting..." : "Add Comment"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Post Modal */}
      <Modal show={showEditPostModal} onHide={() => setShowEditPostModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditPost}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editPostForm.title}
                onChange={handleEditPostFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="content"
                value={editPostForm.content}
                onChange={handleEditPostFormChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditPostModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isEditingPost}>
              {isEditingPost ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Post Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post? This action cannot be undone.
          <p className="mt-2">
            <strong>{selectedPost?.title}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePost}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Member Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Update role for <strong>{selectedMember?.user?.name || "Unknown User"}</strong>
          </p>
          <Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRole} disabled={isUpdatingRole}>
            {isUpdatingRole ? "Updating..." : "Update Role"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CommunityDetailsPage