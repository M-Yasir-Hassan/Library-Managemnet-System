"use client"

import { useEffect, useState } from "react"
import { Row, Col } from "react-bootstrap"
import BookCard from "../../components/books/BookCard"
import BookFilter from "../../components/books/BookFilter"
import Pagination from "../../components/common/Pagination"
import Loader from "../../components/common/Loader"
import { useBook } from "../../contexts/BookContext"

const BooksPage = () => {
  const { books, loading, pagination, getBooks } = useBook()
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    getBooks({ ...filters, page: currentPage })
  }, [getBooks, currentPage, filters])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const handleFilter = (filterData) => {
    setFilters(filterData)
    setCurrentPage(1)
  }

  return (
    <div>
      <h1 className="mb-4">Books</h1>

      <BookFilter onFilter={handleFilter} />

      {loading ? (
        <Loader />
      ) : (
        <>
          {books.length === 0 ? (
            <div className="text-center my-5">
              <h3>No books found</h3>
              <p>Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <>
              <Row>
                {books.map((book) => (
                  <Col key={book._id} md={6} lg={4} xl={3} className="mb-4">
                    <BookCard book={book} />
                  </Col>
                ))}
              </Row>

              <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default BooksPage

