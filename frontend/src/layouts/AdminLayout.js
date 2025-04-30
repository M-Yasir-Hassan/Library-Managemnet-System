import { Outlet } from "react-router-dom"
import AdminSidebar from "../components/admin/AdminSidebar"
import AdminHeader from "../components/admin/AdminHeader"
import { Container, Row, Col } from "react-bootstrap"

const AdminLayout = () => {
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1">
        <AdminHeader />
        <Container fluid className="admin-content">
          <Row>
            <Col>
              <Outlet />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default AdminLayout

