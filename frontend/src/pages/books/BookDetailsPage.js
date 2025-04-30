"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Row, Col, Button, Badge, Tabs, Tab, Form, Card } from "react-bootstrap"
import { FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaBookOpen } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import { useBook } from "../../contexts/BookContext"
import { useAuth } from "../../contexts/AuthContext"
import { borrowBook, purchaseBook } from "../../services/transactionService"
import { toast } from "react-toastify"
import moment from "moment"

const BookDetailsPage = () => {
  const { id } = useParams()
  const { book, loading, getBookById, addBookReview } = useBook()
  const { user, isAuthenticated } = useAuth()
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" })
  const [submitting, setSubmitting] = useState(false)
  const [borrowing, setBorrowing] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    getBookById(id)
  }, [getBookById, id])

  const handleReviewChange = (e) => {
    const { name, value } = e.target
    setReviewData({ ...reviewData, [name]: value })
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addBookReview(id, reviewData)
      setReviewData({ rating: 5, comment: "" })
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to borrow books")
      return
    }

    setBorrowing(true)
    try {
      // Set due date to 14 days from now
      const dueDate = moment().add(14, "days").format("YYYY-MM-DD")
      const result = await borrowBook({ bookId: id, dueDate })

      if (result.success) {
        toast.success("Book borrowed successfully!")
        getBookById(id) // Refresh book data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to borrow book")
    } finally {
      setBorrowing(false)
    }
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase books")
      return
    }

    setPurchasing(true)
    try {
      const result = await purchaseBook({ bookId: id, paymentMethod: "credit_card" })

      if (result.success) {
        toast.success("Book purchased successfully!")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to purchase book")
    } finally {
      setPurchasing(false)
    }
  }

  const renderStarRating = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />)
      }
    }

    return stars
  }

  if (loading) return <Loader />

  if (!book) {
    return (
      <div className="text-center my-5">
        <h3>Book not found</h3>
        <Link to="/books" className="btn btn-primary mt-3">
          Back to Books
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/books" className="btn btn-outline-secondary mb-4">
        &larr; Back to Books
      </Link>

      <Row>
        <Col md={4}>
          <img
            src={book.coverImage ? `/${book.coverImage}` : "/placeholder.jpg"}
            alt={book.title}
            className="img-fluid rounded shadow-sm mb-4"
          />

          <div className="d-grid gap-2 mb-4">
            {book.isAvailableForBorrowing && book.availableCopies > 0 && (
              <Button variant="primary" onClick={handleBorrow} disabled={borrowing}>
                <FaBookOpen className="me-2" />
                {borrowing ? "Processing..." : "Borrow Book"}
              </Button>
            )}

            {book.isAvailableForPurchase && (
              <Button variant="success" onClick={handlePurchase} disabled={purchasing}>
                <FaShoppingCart className="me-2" />
                {purchasing ? "Processing..." : `Purchase for $${book.price.toFixed(2)}`}
              </Button>
            )}
          </div>

          <Card className="mb-4">
            <Card.Body>
              <h5>Book Details</h5>
              <hr />
              <p>
                <strong>ISBN:</strong> {book.ISBN}
              </p>
              <p>
                <strong>Publisher:</strong> {book.publisher}
              </p>
              <p>
                <strong>Publication Year:</strong> {book.publicationYear}
              </p>
              <p>
                <strong>Language:</strong> {book.language}
              </p>
              <p>
                <strong>Pages:</strong> {book.pageCount}
              </p>
              <p>
                <strong>Availability:</strong>{" "}
                <Badge bg={book.availableCopies > 0 ? "success" : "danger"}>
                  {book.availableCopies > 0 ? `${book.availableCopies} Available` : "Out of Stock"}
                </Badge>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <h1>{book.title}</h1>
          <h5 className="text-muted mb-3">by {book.author}</h5>

          <div className="d-flex align-items-center mb-3">
            {renderStarRating(book.rating)}
            <span className="ms-2">
              {book.rating.toFixed(1)} ({book.reviews.length} reviews)
            </span>
          </div>

          <div className="mb-4">
            {book.genre.map((g, index) => (
              <Badge bg="secondary" className="me-1 mb-1" key={index}>
                {g}
              </Badge>
            ))}
          </div>

          <Tabs defaultActiveKey="description" className="mb-4">
            <Tab eventKey="description" title="Description">
              <div className="p-3">
                <p>{book.description}</p>
              </div>
            </Tab>

            <Tab eventKey="details" title="Additional Details">
              <div className="p-3">
                {book.summary && (
                  <div className="mb-3">
                    <h5>Summary</h5>
                    <p>{book.summary}</p>
                  </div>
                )}

                {book.targetAudience && (
                  <div className="mb-3">
                    <h5>Target Audience</h5>
                    <p>{book.targetAudience}</p>
                  </div>
                )}

                {book.tableOfContents && book.tableOfContents.length > 0 && (
                  <div className="mb-3">
                    <h5>Table of Contents</h5>
                    <ol>
                      {book.tableOfContents.map((item, index) => (
                        <li key={index}>
                          {item.title} (Page {item.page})
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="reviews" title={`Reviews (${book.reviews.length})`}>
              <div className="p-3">
                {isAuthenticated && (
                  <Card className="mb-4">
                    <Card.Body>
                      <h5>Write a Review</h5>
                      <Form onSubmit={handleReviewSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Rating</Form.Label>
                          <Form.Select name="rating" value={reviewData.rating} onChange={handleReviewChange} required>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Comment</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="comment"
                            value={reviewData.comment}
                            onChange={handleReviewChange}
                            required
                          />
                        </Form.Group>

                        <Button type="submit" variant="primary" disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit Review"}
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                )}

                {book.reviews.length === 0 ? (
                  <p>No reviews yet. Be the first to review this book!</p>
                ) : (
                  book.reviews.map((review, index) => (
                    <Card key={index} className="mb-3 review-card">
                      <Card.Body>
                        <div className="d-flex justify-content-between">
                          <div>
                            <h6>{review.user.name}</h6>
                            <div className="star-rating">{renderStarRating(review.rating)}</div>
                          </div>
                          <small className="text-muted">{moment(review.date).format("MMM D, YYYY")}</small>
                        </div>
                        <p className="mt-2">{review.comment}</p>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </div>
  )
}

export default BookDetailsPage

