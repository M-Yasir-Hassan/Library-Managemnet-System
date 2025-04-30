"use client"

import { Badge } from "react-bootstrap"

import { useState } from "react"
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap"
import { Formik } from "formik"
import * as Yup from "yup"
import { useAuth } from "../../contexts/AuthContext"
import Loader from "../../components/common/Loader"

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  currentPassword: Yup.string().when("password", {
    is: (val) => val && val.length > 0,
    then: () => Yup.string().required("Current password is required to change password"),
    otherwise: () => Yup.string(),
  }),
  password: Yup.string().min(6, "Password must be at least 6 characters").nullable(),
  confirmPassword: Yup.string().when("password", {
    is: (val) => val && val.length > 0,
    then: () =>
      Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    otherwise: () => Yup.string(),
  }),
})

const ProfilePage = () => {
  const { user, loading, updateProfile } = useAuth()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (loading || !user) return <Loader />

  const initialValues = {
    name: user.name || "",
    email: user.email || "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError("")
      setSuccess("")

      const updateData = {
        name: values.name,
        email: values.email,
      }

      // Only include password fields if the user is trying to change password
      if (values.password) {
        updateData.currentPassword = values.currentPassword
        updateData.newPassword = values.password
      }

      const result = await updateProfile(updateData)

      if (result.success) {
        setSuccess("Profile updated successfully")
        // Reset password fields
        resetForm({
          values: {
            ...values,
            currentPassword: "",
            password: "",
            confirmPassword: "",
          },
        })
      } else {
        setError(result.error?.response?.data?.message || "Failed to update profile")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-4">My Profile</h1>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h4 className="mb-4">Account Information</h4>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Formik initialValues={initialValues} validationSchema={ProfileSchema} onSubmit={handleSubmit}>
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                      />
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                      />
                      <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>

                    <hr className="my-4" />
                    <h5 className="mb-3">Change Password</h5>

                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={values.currentPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.currentPassword && errors.currentPassword}
                      />
                      <Form.Control.Feedback type="invalid">{errors.currentPassword}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                      />
                      <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.confirmPassword && errors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <img
                  src={user.profileImage || "/placeholder.jpg"}
                  alt={user.name}
                  className="rounded-circle"
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              </div>
              <h5>{user.name}</h5>
              <p className="text-muted">{user.email}</p>
              <p>
                <Badge bg="primary">{user.role}</Badge>
              </p>
              <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h5 className="mb-3">Account Statistics</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Books Borrowed:</span>
                <span className="fw-bold">{user.stats?.borrowedCount || user.borrowedBooks?.length || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Books Purchased:</span>
                <span className="fw-bold">{user.stats?.purchasedCount || user.purchasedBooks?.length || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Reviews Written:</span>
                <span className="fw-bold">{user.stats?.reviewCount || user.reviews?.length || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Communities Joined:</span>
                <span className="fw-bold">{user.stats?.communitiesCount || user.communities?.length || 0}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProfilePage