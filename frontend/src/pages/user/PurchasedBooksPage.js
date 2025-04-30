"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, Row, Col, Form, Badge } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaBook, FaShoppingCart, FaCalendarAlt, FaSearch } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import { getUserPurchasedBooks } from "../../services/userService"
import { toast } from "react-toastify"
import moment from "moment"

const PurchasedBooksPage = () => {
  const [purchasedBooks, setPurchasedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("-purchaseDate")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPurchasedBooks = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        sort: sortBy,
        search: searchTerm,
      }
      const response = await getUserPurchasedBooks(params)
      if (response.success) {
        setPurchasedBooks(response.purchasedBooks || [])
        setPagination({
          page: response.page || 1,
          pages: response.pages || 1,
          total: response.total || 0,
        })
      } else {
        toast.error("Failed to fetch purchased books")
      }
    } catch (error) {
      console.error("Error fetching purchased books:", error)
      toast.error(error.response?.data?.message || "Failed to fetch purchased books")
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortBy, searchTerm])

  useEffect(() => {
    fetchPurchasedBooks()
  }, [fetchPurchasedBooks])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPurchasedBooks()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Purchased Books</h1>
        <Link to="/books" className="btn btn-outline-primary">
          <FaBook className="me-2" /> Browse Books
        </Link>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4}>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success text-white p-3 me-3">
                  <FaShoppingCart size={20} />
                </div>
                <div>
                  <h5 className="mb-0">Purchased Books</h5>
                  <p className="text-muted mb-0">{pagination.total} total</p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <Form onSubmit={handleSearch}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <FaSearch />
                  </button>
                </div>
              </Form>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Select value={sortBy} onChange={handleSortChange}>
                  <option value="-purchaseDate">Most Recent</option>
                  <option value="purchaseDate">Oldest</option>
                  <option value="book.title">Title (A-Z)</option>
                  <option value="-book.title">Title (Z-A)</option>
                  <option value="price">Price (Low-High)</option>
                  <option value="-price">Price (High-Low)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Loader />
      ) : (
        <>
          {purchasedBooks.length === 0 ? (
            <Card className="text-center shadow-sm">
              <Card.Body className="py-5">
                <div className="mb-3">
                  <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center p-4 mb-3">
                    <FaShoppingCart size={40} className="text-secondary" />
                  </div>
                </div>
                <h4>You haven't purchased any books yet</h4>
                <p className="text-muted mb-4">Browse our collection and purchase books to see them here.</p>
                <Link to="/books" className="btn btn-primary">
                  <FaBook className="me-2" /> Browse Books
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Row>
                {purchasedBooks.map((item) => (
                  <Col key={item._id} md={6} lg={4} className="mb-4">
                    <Card className="h-100 purchased-book-card shadow-sm">
                      <Row className="g-0 h-100">
                        <Col xs={4} className="overflow-hidden">
                          <img
                            src={item.book.coverImage ? `/${item.book.coverImage}` : "/placeholder.jpg"}
                            alt={item.book.title}
                            className="img-fluid rounded-start h-100"
                            style={{ objectFit: "cover" }}
                          />
                        </Col>
                        <Col xs={8}>
                          <Card.Body className="d-flex flex-column h-100">
                            <div>
                              <Card.Title className="text-truncate">{item.book.title}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted text-truncate">
                                {item.book.author}
                              </Card.Subtitle>
                              <div className="mb-2">
                                <small className="text-muted d-flex align-items-center">
                                  <FaCalendarAlt className="me-1" size={12} />
                                  Purchased on {moment(item.purchaseDate).format("MMM D, YYYY")}
                                </small>
                              </div>
                              <div className="mb-3">
                                <Badge className="price-badge">${item.price ? item.price.toFixed(2) : "0.00"}</Badge>
                              </div>
                            </div>
                            <div className="mt-auto">
                              <Link to={`/books/${item.book._id}`} className="btn btn-primary btn-sm w-100">
                                <FaBook className="me-1" /> View Book
                              </Link>
                            </div>
                          </Card.Body>
                        </Col>
                      </Row>
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
    </div>
  )
}

export default PurchasedBooksPage