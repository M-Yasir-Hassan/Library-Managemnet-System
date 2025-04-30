"use client"

import { useEffect, useState } from "react"
import { Row, Col, Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getBooks } from "../services/bookService"
import BookCard from "../components/books/BookCard"
import Loader from "../components/common/Loader"
import { FaBook, FaUsers, FaExchangeAlt, FaArrowRight, FaStar } from "react-icons/fa"

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)

        // Fetch featured books
        const featuredResponse = await getBooks({ featured: true, pageSize: 4 })
        if (featuredResponse.success) {
          setFeaturedBooks(featuredResponse.books)
        }

        // Fetch new arrivals
        const newArrivalsResponse = await getBooks({ sort: "-createdAt", pageSize: 4 })
        if (newArrivalsResponse.success) {
          setNewArrivals(newArrivalsResponse.books)
        }
      } catch (error) {
        setError("Failed to fetch books")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="text-center my-5">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section text-white p-5 mb-5">
        <Row className="align-items-center">
          <Col md={7}>
            <h1 className="display-4 fw-bold mb-3 text-white">Discover Your Next Favorite Book</h1>
            <p className="lead fs-4 mb-4">
              Explore our vast collection of books, join reading communities, and connect with fellow book lovers.
            </p>
            <div className="d-flex gap-3">
              <Link to="/books" className="btn btn-light btn-lg">
                Browse Books
              </Link>
              <Link to="/register" className="btn btn-outline-light btn-lg">
                Join Now
              </Link>
            </div>
          </Col>
          <Col md={5} className="d-none d-md-block">
            <img
              src="/library.png"
              alt="Library"
              className="img-fluid rounded shadow"
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />
          </Col>
        </Row>
      </div>

      {/* Stats Section */}
      <Row className="text-center mb-5">
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="border-0 shadow-sm py-4">
            <Card.Body>
              <div className="display-4 fw-bold text-primary mb-2">5,000+</div>
              <h3 className="h5">Books Available</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="border-0 shadow-sm py-4">
            <Card.Body>
              <div className="display-4 fw-bold text-primary mb-2">1,200+</div>
              <h3 className="h5">Active Members</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm py-4">
            <Card.Body>
              <div className="display-4 fw-bold text-primary mb-2">50+</div>
              <h3 className="h5">Reading Communities</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Featured Books Section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Featured Books</h2>
          <Link to="/books" className="btn btn-outline-primary d-flex align-items-center">
            View All <FaArrowRight className="ms-2" />
          </Link>
        </div>
        <Row>
          {featuredBooks.length > 0 ? (
            featuredBooks.map((book) => (
              <Col key={book._id} md={6} lg={3} className="mb-4">
                <BookCard book={{ ...book, featured: true }} />
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">No featured books available.</p>
            </Col>
          )}
        </Row>
      </section>

      {/* New Arrivals Section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">New Arrivals</h2>
          <Link to="/books" className="btn btn-outline-primary d-flex align-items-center">
            View All <FaArrowRight className="ms-2" />
          </Link>
        </div>
        <Row>
          {newArrivals.length > 0 ? (
            newArrivals.map((book) => (
              <Col key={book._id} md={6} lg={3} className="mb-4">
                <BookCard book={book} />
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">No new arrivals available.</p>
            </Col>
          )}
        </Row>
      </section>

      {/* Features Section */}
      <section className="mb-5 py-5 bg-light rounded-3">
        <h2 className="mb-4 text-center">Why Choose Our Library</h2>
        <Row className="justify-content-center">
          <Col md={4} className="mb-4">
            <Card className="h-100 feature-card text-center border-0">
              <Card.Body className="d-flex flex-column align-items-center">
                <div
                  className="feature-icon text-white rounded-circle mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaBook size={30} />
                </div>
                <h3 className="h4 mb-3">Extensive Collection</h3>
                <p className="text-muted">Access thousands of books across various genres, authors, and languages.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 feature-card text-center border-0">
              <Card.Body className="d-flex flex-column align-items-center">
                <div
                  className="feature-icon text-white rounded-circle mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaUsers size={30} />
                </div>
                <h3 className="h4 mb-3">Community Engagement</h3>
                <p className="text-muted">
                  Join communities based on your interests, discuss books, and connect with fellow readers.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 feature-card text-center border-0">
              <Card.Body className="d-flex flex-column align-items-center">
                <div
                  className="feature-icon text-white rounded-circle mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaExchangeAlt size={30} />
                </div>
                <h3 className="h4 mb-3">Easy Borrowing</h3>
                <p className="text-muted">
                  Borrow books with just a few clicks and manage your reading list efficiently.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Testimonials Section */}
      <section className="mb-5">
        <h2 className="text-center mb-4">What Our Members Say</h2>
        <Row className="justify-content-center">
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm testimonial-card">
              <Card.Body className="p-4">
                <div className="mb-3 text-warning">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p className="mb-3">
                  "This library has transformed my reading habits. The vast collection and easy borrowing process make
                  it a joy to use."
                </p>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: "40px", height: "40px" }}
                  >
                    JD
                  </div>
                  <div>
                    <h5 className="mb-0 h6">John Doe</h5>
                    <small className="text-muted">Member since 2022</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm testimonial-card">
              <Card.Body className="p-4">
                <div className="mb-3 text-warning">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p className="mb-3">
                  "I love the community aspect! Being able to discuss books with like-minded readers has enhanced my
                  reading experience."
                </p>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: "40px", height: "40px" }}
                  >
                    JS
                  </div>
                  <div>
                    <h5 className="mb-0 h6">Jane Smith</h5>
                    <small className="text-muted">Member since 2021</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm testimonial-card">
              <Card.Body className="p-4">
                <div className="mb-3 text-warning">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p className="mb-3">
                  "The digital interface is intuitive and user-friendly. I can find and borrow books in minutes from
                  anywhere."
                </p>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: "40px", height: "40px" }}
                  >
                    RJ
                  </div>
                  <div>
                    <h5 className="mb-0 h6">Robert Johnson</h5>
                    <small className="text-muted">Member since 2023</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Call to Action */}
      <section className="text-center py-5 mb-4 bg-primary text-white rounded-3">
        <h2 className="mb-3 text-white">Ready to Start Reading?</h2>
        <p className="lead mb-4">Join our library today and get access to thousands of books.</p>
        <Link to="/register" className="btn btn-light btn-lg px-4">
          Sign Up Now
        </Link>
      </section>
    </div>
  )
}

export default HomePage

