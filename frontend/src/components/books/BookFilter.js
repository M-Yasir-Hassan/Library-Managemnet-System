"use client"

import { useState } from "react"
import { Form, Button, Row, Col, Card } from "react-bootstrap"

const BookFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    author: "",
    year: "",
    language: "",
    available: false,
    sort: "createdAt",
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onFilter(filters)
  }

  const handleReset = () => {
    setFilters({
      search: "",
      genre: "",
      author: "",
      year: "",
      language: "",
      available: false,
      sort: "createdAt",
    })
    onFilter({})
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Filter Books</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleChange}
                  placeholder="Search by title, author, etc."
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Genre</Form.Label>
                <Form.Control
                  type="text"
                  name="genre"
                  value={filters.genre}
                  onChange={handleChange}
                  placeholder="e.g. Fiction, Fantasy"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Author</Form.Label>
                <Form.Control
                  type="text"
                  name="author"
                  value={filters.author}
                  onChange={handleChange}
                  placeholder="Author name"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Publication Year</Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  value={filters.year}
                  onChange={handleChange}
                  placeholder="e.g. 2023"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Control
                  type="text"
                  name="language"
                  value={filters.language}
                  onChange={handleChange}
                  placeholder="e.g. English"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Sort By</Form.Label>
                <Form.Select name="sort" value={filters.sort} onChange={handleChange}>
                  <option value="createdAt">Newest</option>
                  <option value="-createdAt">Oldest</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="-title">Title (Z-A)</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="-price">Price (High to Low)</option>
                  <option value="-rating">Rating (High to Low)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3 mt-4">
                <Form.Check
                  type="checkbox"
                  label="Available Only"
                  name="available"
                  checked={filters.available}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleReset} className="me-2">
              Reset
            </Button>
            <Button variant="primary" type="submit">
              Apply Filters
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default BookFilter

