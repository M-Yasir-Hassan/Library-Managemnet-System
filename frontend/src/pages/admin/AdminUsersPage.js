"use client"

import { Badge } from "react-bootstrap"

import { useEffect, useState } from "react"
import { Card, Button, Table, Form, Row, Col, Modal } from "react-bootstrap"
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import { getUsers, updateUser, deleteUser } from "../../services/userService"
import { toast } from "react-toastify"

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
    isActive: true,
  })
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    sort: "createdAt",
  })

  useEffect(() => {
    fetchUsers()
  }, [currentPage, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        search: searchTerm,
        ...filters,
      }
      const response = await getUsers(params)
      if (response.success) {
        setUsers(response.users)
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total,
        })
      }
    } catch (error) {
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleEditClick = (user) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    })
    setShowEditModal(true)
  }

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const result = await updateUser(selectedUser._id, editForm)
      if (result.success) {
        toast.success("User updated successfully")
        fetchUsers()
        setShowEditModal(false)
      }
    } catch (error) {
      toast.error("Failed to update user")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      const result = await deleteUser(selectedUser._id)
      if (result.success) {
        toast.success("User deleted successfully")
        fetchUsers()
        setShowDeleteModal(false)
      }
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  return (
    <div>
      <h1 className="mb-4">Manage Users</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search users..."
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
                    <Form.Select name="role" value={filters.role} onChange={handleFilterChange}>
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="librarian">Librarian</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="isActive" value={filters.isActive} onChange={handleFilterChange}>
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="sort" value={filters.sort} onChange={handleFilterChange}>
                      <option value="createdAt">Newest</option>
                      <option value="-createdAt">Oldest</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="-name">Name (Z-A)</option>
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
              {users.length === 0 ? (
                <div className="text-center py-4">
                  <h4>No users found</h4>
                  <p>Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <Badge
                              bg={user.role === "admin" ? "danger" : user.role === "librarian" ? "info" : "secondary"}
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={user.isActive ? "success" : "danger"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditClick(user)}>
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteClick(user)}>
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

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={editForm.name} onChange={handleEditFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={editForm.email} onChange={handleEditFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={editForm.role} onChange={handleEditFormChange}>
                <option value="user">User</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                name="isActive"
                checked={editForm.isActive}
                onChange={handleEditFormChange}
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
          Are you sure you want to delete the user "{selectedUser?.name}"? This action cannot be undone.
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

export default AdminUsersPage

