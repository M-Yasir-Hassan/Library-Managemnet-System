"use client"

import { useState } from "react"
import { Row, Col, Container, Card, Form, Button, Alert } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaBook, FaEnvelope } from "react-icons/fa"
import { Formik } from "formik"
import * as Yup from "yup"

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
})

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError("")
      // Here you would call your API to send a password reset email
      // For now, we'll just simulate a successful submission
      setTimeout(() => {
        setSubmitted(true)
        setSubmitting(false)
      }, 1000)
    } catch (err) {
      setError("An error occurred. Please try again later.")
      setSubmitting(false)
    }
  }

  return (
    <Container>
      <Row className="justify-content-center align-items-center min-vh-75 py-5">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <FaBook className="text-primary" size={40} />
            <h1 className="mt-2">Library Management System</h1>
          </div>

          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Forgot Password</h2>
                <p className="text-muted">Enter your email to reset your password</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              {submitted ? (
                <Alert variant="success">
                  <p className="mb-0">
                    If an account exists with the email you provided, you will receive password reset instructions.
                  </p>
                </Alert>
              ) : (
                <Formik initialValues={{ email: "" }} validationSchema={ForgotPasswordSchema} onSubmit={handleSubmit}>
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label>Email Address</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaEnvelope />
                          </span>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.email && errors.email}
                          />
                          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                        </div>
                      </Form.Group>

                      <Button variant="primary" type="submit" className="w-100 py-2 mb-3" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Reset Password"}
                      </Button>
                    </Form>
                  )}
                </Formik>
              )}

              <div className="text-center">
                <p className="mb-0">
                  Remember your password?{" "}
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Back to Login
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ForgotPasswordPage

