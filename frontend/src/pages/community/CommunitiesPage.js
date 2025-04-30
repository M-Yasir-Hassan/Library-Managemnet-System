"use client"

import { useEffect, useState } from "react"
import { Card, Button, Row, Col, Form, Badge, Modal } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaSearch, FaPlus, FaUsers, FaLock, FaUnlock } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import { getCommunities, createCommunity } from "../../services/communityService"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"

const CommunitiesPage = () => {
  const { isAuthenticated } = useAuth()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [communityForm, setCommunityForm] = useState({
    name: "",
    description: "",
    category: "",
    isPrivate: false,
    type: "discussion",
  })
  const [filters, setFilters] = useState({
    category: "",
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
      console.error("Error fetching communities:", error)
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
    if (!isAuthenticated) {
      toast.error("Please login to create a community")
      return
    }

    setCommunityForm({
      name: "",
      description: "",
      category: "",
      isPrivate: false,
      type: "discussion",
    })
    setShowCreateModal(true)
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
      toast.error(error.response?.data?.message || "Failed to create community")
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Communities</h1>
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
                <Col md={6}>
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
                <Col md={6}>
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
          {communities.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <h4>No communities found</h4>
                <p>Try adjusting your search or filters, or create a new community.</p>
                <Button variant="primary" onClick={handleCreateClick} className="mt-3">
                  <FaPlus className="me-2" /> Create Community
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Row>
                {communities.map((community) => (
                  <Col key={community._id} md={6} lg={4} className="mb-4">
                    <Card className="h-100 community-card">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <Card.Title>{community.name}</Card.Title>
                          {community.isPrivate ? (
                            <FaLock className="text-warning" title="Private Community" />
                          ) : (
                            <FaUnlock className="text-success" title="Public Community" />
                          )}
                        </div>
                        <Badge bg="secondary" className="mb-2">
                          {community.category}
                        </Badge>
                        {community.type && (
                          <Badge bg="info" className="mb-2 ms-2">
                            {community.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        )}
                        <Card.Text className="mb-3">{community.description}</Card.Text>
                        <div className="d-flex align-items-center mb-3">
                          <FaUsers className="text-primary me-2" />
                          <span>{community.members?.length || community.memberCount || 0} members</span>
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-white">
                        <Link to={`/communities/${community._id}`} className="btn btn-outline-primary w-100">
                          View Community
                        </Link>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>

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
              <Form.Text className="text-muted">
                Private communities require approval to join and are not visible to non-members.
              </Form.Text>
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
    </div>
  )
}

export default CommunitiesPage