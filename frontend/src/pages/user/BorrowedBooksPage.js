"use client"

import { useEffect, useState } from "react"
import { Card, Table, Badge, Button, Row, Col, Form } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaBook, FaCalendarAlt } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import { getUserBorrowedBooks } from "../../services/userService"
import { returnBook } from "../../services/transactionService"
import { toast } from "react-toastify"
import moment from "moment"

const BorrowedBooksPage = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    status: "",
    sort: "-borrowDate",
  })
  const [returningBook, setReturningBook] = useState(null)

  useEffect(() => {
    fetchBorrowedBooks()
  }, [currentPage, filters])

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        ...filters,
      }
      const response = await getUserBorrowedBooks(params)
      if (response.success) {
        setBorrowedBooks(response.borrowedBooks)
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total,
        })
      }
    } catch (error) {
      toast.error("Failed to fetch borrowed books")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleReturnBook = async (transactionId, bookId) => {
    try {
      setReturningBook(transactionId)
      const result = await returnBook({
        transactionId,
        bookId: bookId, // Add the bookId to the request
      })
      if (result.success) {
        toast.success("Book returned successfully")
        fetchBorrowedBooks()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return book")
    } finally {
      setReturningBook(null)
    }
  }

  const getStatusBadge = (status, dueDate) => {
    const now = moment()
    const due = moment(dueDate)
    const isOverdue = due.isBefore(now) && status !== "returned"

    if (status === "returned") {
      return <Badge bg="success">Returned</Badge>
    } else if (isOverdue) {
      return <Badge bg="danger">Overdue</Badge>
    } else {
      return <Badge bg="primary">Borrowed</Badge>
    }
  }

  const getDaysRemaining = (dueDate, status) => {
    if (status === "returned") {
      return "Returned"
    }

    const now = moment()
    const due = moment(dueDate)
    const days = due.diff(now, "days")

    if (days < 0) {
      return <span className="text-danger">{Math.abs(days)} days overdue</span>
    } else if (days === 0) {
      return <span className="text-warning">Due today</span>
    } else {
      return <span>{days} days remaining</span>
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Borrowed Books</h1>
        <Link to="/books" className="btn btn-outline-primary">
          <FaBook className="me-2" /> Browse Books
        </Link>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="text-primary me-2" size={20} />
                <h5 className="mb-0">You have borrowed {pagination.total} books</h5>
              </div>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                      <option value="">All Status</option>
                      <option value="active">Currently Borrowed</option>
                      <option value="returned">Returned</option>
                      <option value="overdue">Overdue</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Select name="sort" value={filters.sort} onChange={handleFilterChange}>
                      <option value="-borrowDate">Most Recent</option>
                      <option value="borrowDate">Oldest</option>
                      <option value="dueDate">Due Date (Soonest)</option>
                      <option value="-dueDate">Due Date (Latest)</option>
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
          {borrowedBooks.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <h4>You haven't borrowed any books yet</h4>
                <p>Browse our collection and borrow books to see them here.</p>
                <Link to="/books" className="btn btn-primary mt-3">
                  <FaBook className="me-2" /> Browse Books
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Borrowed Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowedBooks.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={item.book.coverImage ? `/${item.book.coverImage}` : "/placeholder.jpg"}
                                alt={item.book.title}
                                style={{ width: "40px", height: "60px", objectFit: "cover" }}
                                className="me-3"
                              />
                              <div>
                                <Link to={`/books/${item.book._id}`} className="text-decoration-none">
                                  <strong>{item.book.title}</strong>
                                </Link>
                                <div className="text-muted small">{item.book.author}</div>
                              </div>
                            </div>
                          </td>
                          <td>{moment(item.borrowDate).format("MMM D, YYYY")}</td>
                          <td>
                            {moment(item.dueDate).format("MMM D, YYYY")}
                            <div className="small">{getDaysRemaining(item.dueDate, item.status)}</div>
                          </td>
                          <td>{getStatusBadge(item.status, item.dueDate)}</td>
                          <td>
                            {item.status !== "returned" && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleReturnBook(item._id, item.book._id)}
                                disabled={returningBook === item._id}
                              >
                                {returningBook === item._id ? "Returning..." : "Return Book"}
                              </Button>
                            )}
                            <Link to={`/books/${item.book._id}`} className="btn btn-outline-secondary btn-sm ms-2">
                              View Book
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
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
          )}
        </>
      )}
    </div>
  )
}

export default BorrowedBooksPage