import { Container, Row, Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaBook, FaEnvelope, FaMapMarkerAlt, FaPhone, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="text-white py-5 mt-auto">
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-4 mb-md-0">
            <div className="d-flex align-items-center mb-3">
              <FaBook className="me-2" size={24} />
              <h5 className="mb-0">Library Management System</h5>
            </div>
            <p className="mb-3">A comprehensive platform for managing books, communities, and more.</p>
            <div className="social-icons d-flex gap-3">
              <a href="#" className="text-white social-icon">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-white social-icon">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-white social-icon">
                <FaInstagram size={20} />
              </a>
            </div>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link to="/" className="text-white d-block py-1">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/books" className="text-white d-block py-1">
                  Books
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/communities" className="text-white d-block py-1">
                  Communities
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-white d-block py-1">
                  Login
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-white d-block py-1">
                  Register
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <address className="mb-0">
              <p className="mb-2 d-flex align-items-center">
                <FaMapMarkerAlt className="me-2" /> 123 Library Street, Bookville, BK 12345
              </p>
              <p className="mb-2 d-flex align-items-center">
                <FaEnvelope className="me-2" /> info@librarysystem.com
              </p>
              <p className="mb-2 d-flex align-items-center">
                <FaPhone className="me-2" /> (123) 456-7890
              </p>
            </address>
          </Col>
        </Row>
        <Row>
          <Col className="text-center pt-3 border-top border-light">
            <p className="small mb-0">
              &copy; {new Date().getFullYear()} Library Management System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer

