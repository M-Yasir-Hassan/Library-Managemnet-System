"use client"
import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"
import { FaBook, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa"

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount } = useNotification()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top" className="py-2">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaBook className="me-2" size={24} />
          <span className="fw-bold">Library Management System</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="mx-1">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/books" className="mx-1">
              Books
            </Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/communities" className="mx-1">
                  Communities
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/notifications" className="mx-1 position-relative">
                  <FaBell size={18} />
                  {unreadCount > 0 && (
                    <Badge pill className="position-absolute top-0 start-100 translate-middle notification-badge">
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
                <NavDropdown
                  title={
                    <div className="d-inline-flex align-items-center">
                      <div className="avatar-circle me-1">
                        <FaUser size={14} />
                      </div>
                      <span>{user?.name || "User"}</span>
                    </div>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/borrowed-books">
                    Borrowed Books
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/purchased-books">
                    Purchased Books
                  </NavDropdown.Item>
                  {user?.role === "admin" && (
                    <NavDropdown.Item as={Link} to="/admin">
                      Admin Dashboard
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <FaSignOutAlt className="me-2" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="mx-1">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn btn-light text-primary ms-2 px-3">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header

