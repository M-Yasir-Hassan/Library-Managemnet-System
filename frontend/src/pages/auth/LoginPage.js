import { Row, Col, Container } from "react-bootstrap"
import LoginForm from "../../components/auth/LoginForm"
import { FaBook } from "react-icons/fa"

const LoginPage = () => {
  return (
    <Container>
      <Row className="justify-content-center align-items-center min-vh-75 py-5">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <FaBook className="text-primary" size={40} />
            <h1 className="mt-2">Library Management System</h1>
          </div>
          <LoginForm />
        </Col>
      </Row>
    </Container>
  )
}

export default LoginPage

