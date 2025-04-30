"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap"
import { Formik } from "formik"
import * as Yup from "yup"
import { FaSave, FaArrowLeft } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import { useBook } from "../../contexts/BookContext"

const BookSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  author: Yup.string().required("Author is required"),
  ISBN: Yup.string().required("ISBN is required"),
  description: Yup.string().required("Description is required"),
  publisher: Yup.string().required("Publisher is required"),
  publicationYear: Yup.number()
    .required("Publication year is required")
    .integer("Must be a whole number")
    .min(1000, "Invalid year")
    .max(new Date().getFullYear(), "Cannot be in the future"),
  language: Yup.string().required("Language is required"),
  pageCount: Yup.number()
    .required("Page count is required")
    .integer("Must be a whole number")
    .min(1, "Must have at least 1 page"),
  totalCopies: Yup.number()
    .required("Total copies is required")
    .integer("Must be a whole number")
    .min(0, "Cannot be negative"),
  availableCopies: Yup.number()
    .required("Available copies is required")
    .integer("Must be a whole number")
    .min(0, "Cannot be negative")
    .test("availableCopies", "Available copies cannot exceed total copies", function (value) {
      return value <= this.parent.totalCopies
    }),
  price: Yup.number().required("Price is required").min(0, "Price cannot be negative"),
  isAvailableForBorrowing: Yup.boolean(),
  isAvailableForPurchase: Yup.boolean(),
  featured: Yup.boolean(),
})

const AddEditBookPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getBookById, createBook, updateBook } = useBook()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [book, setBook] = useState(null)
  const [coverPreview, setCoverPreview] = useState("")
  const isEditMode = !!id

  const initialValues = {
    title: "",
    author: "",
    ISBN: "",
    description: "",
    summary: "",
    genre: [],
    publisher: "",
    publicationYear: new Date().getFullYear(),
    language: "English",
    pageCount: 0,
    totalCopies: 1,
    availableCopies: 1,
    price: 0,
    isAvailableForBorrowing: true,
    isAvailableForPurchase: true,
    featured: false,
    targetAudience: "",
    coverImage: null,
  }

  useEffect(() => {
    if (isEditMode) {
      fetchBook()
    }
  }, [id])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await getBookById(id)
      if (response.success) {
        setBook(response.book)
        // If there's a cover image, set the preview
        if (response.book.coverImage) {
          setCoverPreview(`/${response.book.coverImage}`)
        }
      } else {
        setError("Failed to fetch book details")
      }
    } catch (error) {
      setError("An error occurred while fetching book details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError("")
      setSubmitting(true)

      // Convert genre string to array if needed
      if (typeof values.genre === "string") {
        values.genre = values.genre.split(",").map((g) => g.trim())
      }

      const formData = {
        ...values,
        // Handle file upload
        coverImage: values.coverImage instanceof File ? values.coverImage : undefined,
      }

      let response
      if (isEditMode) {
        response = await updateBook(id, formData)
      } else {
        response = await createBook(formData)
      }

      if (response.success) {
        navigate("/admin/books")
      } else {
        setError("Failed to save book")
      }
    } catch (error) {
      setError("An error occurred while saving the book")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCoverImageChange = (e, setFieldValue) => {
    const file = e.target.files[0]
    if (file) {
      setFieldValue("coverImage", file)
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) return <Loader />

  // Prepare form values for edit mode
  const formValues =
    isEditMode && book
      ? {
          ...initialValues,
          ...book,
          genre: Array.isArray(book.genre) ? book.genre.join(", ") : book.genre,
          coverImage: null, // Don't set the file input value
        }
      : initialValues

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditMode ? "Edit Book" : "Add New Book"}</h1>
        <Button variant="secondary" onClick={() => navigate("/admin/books")}>
          <FaArrowLeft className="me-2" /> Back to Books
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Formik initialValues={formValues} validationSchema={BookSchema} onSubmit={handleSubmit} enableReinitialize>
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={values.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.title && errors.title}
                      />
                      <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Author</Form.Label>
                      <Form.Control
                        type="text"
                        name="author"
                        value={values.author}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.author && errors.author}
                      />
                      <Form.Control.Feedback type="invalid">{errors.author}</Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>ISBN</Form.Label>
                          <Form.Control
                            type="text"
                            name="ISBN"
                            value={values.ISBN}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.ISBN && errors.ISBN}
                          />
                          <Form.Control.Feedback type="invalid">{errors.ISBN}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Genre (comma separated)</Form.Label>
                          <Form.Control
                            type="text"
                            name="genre"
                            value={values.genre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.description && errors.description}
                      />
                      <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Summary (optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="summary"
                        value={values.summary}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Publisher</Form.Label>
                          <Form.Control
                            type="text"
                            name="publisher"
                            value={values.publisher}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.publisher && errors.publisher}
                          />
                          <Form.Control.Feedback type="invalid">{errors.publisher}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Publication Year</Form.Label>
                          <Form.Control
                            type="number"
                            name="publicationYear"
                            value={values.publicationYear}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.publicationYear && errors.publicationYear}
                          />
                          <Form.Control.Feedback type="invalid">{errors.publicationYear}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Language</Form.Label>
                          <Form.Control
                            type="text"
                            name="language"
                            value={values.language}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.language && errors.language}
                          />
                          <Form.Control.Feedback type="invalid">{errors.language}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Page Count</Form.Label>
                          <Form.Control
                            type="number"
                            name="pageCount"
                            value={values.pageCount}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.pageCount && errors.pageCount}
                          />
                          <Form.Control.Feedback type="invalid">{errors.pageCount}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Total Copies</Form.Label>
                          <Form.Control
                            type="number"
                            name="totalCopies"
                            value={values.totalCopies}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.totalCopies && errors.totalCopies}
                          />
                          <Form.Control.Feedback type="invalid">{errors.totalCopies}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Available Copies</Form.Label>
                          <Form.Control
                            type="number"
                            name="availableCopies"
                            value={values.availableCopies}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.availableCopies && errors.availableCopies}
                          />
                          <Form.Control.Feedback type="invalid">{errors.availableCopies}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Price ($)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            name="price"
                            value={values.price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.price && errors.price}
                          />
                          <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Target Audience (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="targetAudience"
                        value={values.targetAudience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Available for Borrowing"
                            name="isAvailableForBorrowing"
                            checked={values.isAvailableForBorrowing}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Available for Purchase"
                            name="isAvailableForPurchase"
                            checked={values.isAvailableForPurchase}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Featured Book"
                            name="featured"
                            checked={values.featured}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>

                  <Col md={4}>
                    <Card>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Cover Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCoverImageChange(e, setFieldValue)}
                          />
                          <Form.Text className="text-muted">Recommended size: 600x900 pixels</Form.Text>
                        </Form.Group>

                        {coverPreview && (
                          <div className="text-center mt-3">
                            <img
                              src={coverPreview || "/placeholder.svg"}
                              alt="Cover Preview"
                              className="img-thumbnail"
                              style={{ maxHeight: "300px" }}
                            />
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <Button variant="secondary" onClick={() => navigate("/admin/books")} className="me-md-2">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    <FaSave className="me-2" />
                    {isSubmitting ? "Saving..." : "Save Book"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AddEditBookPage

