"use client"

import { useEffect, useState } from "react"
import { Card, Button, Table, Form, Row, Col, Modal } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import { useBook } from "../../contexts/BookContext"
import { toast } from "react-toastify"

const AdminBooksPage = () => {
  const { books, loading, pagination, getBooks, deleteBook } = useBook()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bookToDelete, setBookToDelete] = useState(null)
  const [filters, setFilters] = useState({
    genre: "",
    author: "",
    available: false,
    sort: "createdAt",
  })

  useEffect(() => {
    fetchBooks()
  }, [currentPage, filters])

  const fetchBooks = async () => {
    const params = {
      page: currentPage,
      search: searchTerm,
      ...filters,
    }
    await getBooks(params)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchBooks()
  }

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleDeleteClick = (book) => {
    setBookToDelete(book)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return

    try {
      const result = await deleteBook(bookToDelete._id)
      if (result.success) {
        toast.success("Book deleted successfully")
        fetchBooks()
      }
    } catch (error) {
      toast.error("Failed to delete book")
    } finally {
      setShowDeleteModal(false)
      setBookToDelete(null)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Books</h1>
        <Link to="/admin/books/add" className="btn btn-primary">
          <FaPlus className="me-2" /> Add New Book
        </Link>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search books..."
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
                    <Form.Select name="genre" value={filters.genre} onChange={handleFilterChange}>
                      <option value="">All Genres</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-fiction">Non-fiction</option>
                      <option value="Science">Science</option>
                      <option value="Technology">Technology</option>
                      <option value="History">History</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="sort" value={filters.sort} onChange={handleFilterChange}>
                      <option value="createdAt">Newest</option>
                      <option value="-createdAt">Oldest</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="-title">Title (Z-A)</option>
                      <option value="availableCopies">Available (Low-High)</option>
                      <option value="-availableCopies">Available (High-Low)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    label="Available Only"
                    name="available"
                    checked={filters.available}
                    onChange={handleFilterChange}
                  />
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
              {books.length === 0 ? (
                <div className="text-center py-4">
                  <h4>No books found</h4>
                  <p>Try adjusting your search or filters, or add a new book.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Cover</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Available</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book._id}>
                          <td>
                            <img
                              src={book.coverImage ? `/${book.coverImage}` : "/placeholder.jpg"}
                              alt={book.title}
                              style={{ width: "50px", height: "70px", objectFit: "cover" }}
                            />
                          </td>
                          <td>{book.title}</td>
                          <td>{book.author}</td>
                          <td>{book.ISBN}</td>
                          <td>
                            <span className={`badge ${book.availableCopies > 0 ? "bg-success" : "bg-danger"}`}>
                              {book.availableCopies > 0 ? `${book.availableCopies} copies` : "Out of stock"}
                            </span>
                          </td>
                          <td>${book.price.toFixed(2)}</td>
                          <td>
                            <Link to={`/admin/books/edit/${book._id}`} className="btn btn-sm btn-primary me-2">
                              <FaEdit />
                            </Link>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteClick(book)}>
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the book "{bookToDelete?.title}"? This action cannot be undone.
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

export default AdminBooksPage

