"use client"

import { Link } from "react-router-dom"
import { Badge } from "react-bootstrap"

import { useEffect, useState } from "react"
import { Card, Button, Table, Form, Row, Col, Modal } from "react-bootstrap"
import { FaSearch, FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
} from "../../services/communityService"
import { toast } from "react-toastify"

const AdminCommunitiesPage = () => {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [communityForm, setCommunityForm] = useState({
    name: "",
    description: "",
    category: "",
    isPrivate: false,
    type: "discussion",
  })
  const [filters, setFilters] = useState({
    category: "",
    isPrivate: "",
    sort: "-createdAt",
  })

  useEffect(() => {
    fetchCommunities()
  }, [currentPage, filters])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        search: searchTerm,
        ...filters,
      }
      const response = await getCommunities(params)
      if (response.success) {
        setCommunities(response.communities)
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total,
        })
      }
    } catch (error) {
      toast.error("Failed to fetch communities")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCommunities()
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleCreateClick = () => {
    setCommunityForm({
      name: "",
      description: "",
      category: "",
      isPrivate: false,
      type: "discussion",
    })
    setShowCreateModal(true)
  }

  const handleEditClick = async (communityId) => {
    if (!communityId) {
      toast.error("No community selected")
      return
    }

    try {
      const response = await getCommunityById(communityId)
      if (response.success && response.community) {
        setSelectedCommunity(response.community)
        setCommunityForm({
          name: response.community.name || "",
          description: response.community.description || "",
          category: response.community.category || "",
          isPrivate: response.community.isPrivate || false,
          type: response.community.type || "discussion",
        })
        setShowEditModal(true)
      } else {
        toast.error("Failed to fetch community details")
      }
    } catch (error) {
      toast.error("Failed to fetch community details")
    }
  }

  const handleDeleteClick = (community) => {
    if (!community) {
      toast.error("No community selected")
      return
    }
    setSelectedCommunity(community)
    setShowDeleteModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setCommunityForm({
      ...communityForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await createCommunity(communityForm)
      if (result.success) {
        toast.success("Community created successfully")
        fetchCommunities()
        setShowCreateModal(false)
      }
    } catch (error) {
      toast.error("Failed to create community")
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCommunity || !selectedCommunity._id) {
      toast.error("No community selected")
      return
    }

    try {
      const result = await updateCommunity(selectedCommunity._id, communityForm)
      if (result.success) {
        toast.success("Community updated successfully")
        fetchCommunities()
        setShowEditModal(false)
      }
    } catch (error) {
      toast.error("Failed to update community")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCommunity || !selectedCommunity._id) {
      toast.error("No community selected")
      setShowDeleteModal(false)
      return
    }

    try {
      const result = await deleteCommunity(selectedCommunity._id)
      if (result.success) {
        toast.success("Community deleted successfully")
        fetchCommunities()
        setShowDeleteModal(false)
      }
    } catch (error) {
      toast.error("Failed to delete community")
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Communities</h1>
        <Button variant="primary" onClick={handleCreateClick}>
          <FaPlus className="me-2" /> Create Community
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch />
                  </Button>
                </div>
              </Form>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                      <option value="">All Categories</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-fiction">Non-fiction</option>
                      <option value="Science">Science</option>
                      <option value="Technology">Technology</option>
                      <option value="History">History</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="isPrivate" value={filters.isPrivate} onChange={handleFilterChange}>
                      <option value="">All Privacy</option>
                      <option value="true">Private</option>
                      <option value="false">Public</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="sort" value={filters.sort} onChange={handleFilterChange}>
                      <option value="-createdAt">Newest</option>
                      <option value="createdAt">Oldest</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="-name">Name (Z-A)</option>
                      <option value="-memberCount">Most Members</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Loader />
      ) : (
        <>
          <Card>
            <Card.Body>
              {communities.length === 0 ? (
                <div className="text-center py-4">
                  <h4>No communities found</h4>
                  <p>Try adjusting your search or filters, or create a new community.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Members</th>
                        <th>Privacy</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {communities.map((community) => (
                        <tr key={community._id}>
                          <td>{community.name}</td>
                          <td>{community.category}</td>
                          <td>{community.memberCount || 0}</td>
                          <td>
                            <Badge bg={community.isPrivate ? "warning" : "success"}>
                              {community.isPrivate ? "Private" : "Public"}
                            </Badge>
                          </td>
                          <td>{new Date(community.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2"
                              as={Link}
                              to={`/communities/${community._id}`}
                            >
                              <FaEye />
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditClick(community._id)}
                            >
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteClick(community)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
            {pagination.pages > 1 && (
              <Card.Footer>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </Card.Footer>
            )}
          </Card>
        </>
      )}

      {/* Create Community Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Community</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={communityForm.name} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={communityForm.description}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" value={communityForm.category} onChange={handleFormChange} required>
                <option value="">Select Category</option>
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
              <Form.Select name="type" value={communityForm.type} onChange={handleFormChange} required>
                <option value="discussion">Discussion</option>
                <option value="book-club">Book Club</option>
                <option value="study-group">Study Group</option>
                <option value="author-fan">Author Fan Group</option>
                <option value="genre-specific">Genre Specific</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Private Community"
                name="isPrivate"
                checked={communityForm.isPrivate}
                onChange={handleFormChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Community Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Community</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={communityForm.name} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={communityForm.description}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" value={communityForm.category} onChange={handleFormChange} required>
                <option value="">Select Category</option>
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
              <Form.Select name="type" value={communityForm.type} onChange={handleFormChange} required>
                <option value="discussion">Discussion</option>
                <option value="book-club">Book Club</option>
                <option value="study-group">Study Group</option>
                <option value="author-fan">Author Fan Group</option>
                <option value="genre-specific">Genre Specific</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Private Community"
                name="isPrivate"
                checked={communityForm.isPrivate}
                onChange={handleFormChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCommunity ? (
            <>Are you sure you want to delete the community "{selectedCommunity.name}"? This action cannot be undone.</>
          ) : (
            <>Are you sure you want to delete this community? This action cannot be undone.</>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AdminCommunitiesPage