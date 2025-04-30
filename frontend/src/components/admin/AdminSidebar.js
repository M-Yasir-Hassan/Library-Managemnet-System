import { Nav } from "react-bootstrap"
import { Link, useLocation } from "react-router-dom"
import { FaBook, FaUsers, FaExchangeAlt, FaUsersCog, FaTachometerAlt } from "react-icons/fa"

const AdminSidebar = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <div className="sidebar bg-dark text-white" style={{ width: "250px", minHeight: "100vh" }}>
      <div className="p-3">
        <h4 className="text-center mb-4">Admin Panel</h4>
        <Nav className="flex-column">
          <Nav.Link
            as={Link}
            to="/admin"
            className={
              isActive("/admin") &&
              !isActive("/admin/books") &&
              !isActive("/admin/users") &&
              !isActive("/admin/transactions") &&
              !isActive("/admin/communities")
                ? "active"
                : ""
            }
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/books" className={isActive("/admin/books") ? "active" : ""}>
            <FaBook className="me-2" /> Books
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/users" className={isActive("/admin/users") ? "active" : ""}>
            <FaUsers className="me-2" /> Users
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/transactions" className={isActive("/admin/transactions") ? "active" : ""}>
            <FaExchangeAlt className="me-2" /> Transactions
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/communities" className={isActive("/admin/communities") ? "active" : ""}>
            <FaUsersCog className="me-2" /> Communities
          </Nav.Link>
        </Nav>
      </div>
    </div>
  )
}

export default AdminSidebar

