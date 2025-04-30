import { Row, Col, Container } from "react-bootstrap"
import RegisterForm from "../../components/auth/RegisterForm"
import { FaBook } from "react-icons/fa"

const RegisterPage = () => {
  return (
    <Container>
      <Row className="justify-content-center align-items-center min-vh-75 py-5">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <FaBook className="text-primary" size={40} />
            <h1 className="mt-2">Library Management System</h1>
          </div>
          <RegisterForm />
        </Col>
      </Row>
    </Container>
  )
}

export default RegisterPage

