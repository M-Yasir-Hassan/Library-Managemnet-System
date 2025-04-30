"use client"
import { Pagination as BSPagination } from "react-bootstrap"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    // First page
    if (startPage > 1) {
      pageNumbers.push(
        <BSPagination.Item key={1} onClick={() => onPageChange(1)}>
          1
        </BSPagination.Item>,
      )
      if (startPage > 2) {
        pageNumbers.push(<BSPagination.Ellipsis key="ellipsis-1" disabled />)
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <BSPagination.Item key={i} active={i === currentPage} onClick={() => onPageChange(i)}>
          {i}
        </BSPagination.Item>,
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<BSPagination.Ellipsis key="ellipsis-2" disabled />)
      }
      pageNumbers.push(
        <BSPagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </BSPagination.Item>,
      )
    }

    return pageNumbers
  }

  if (totalPages <= 1) return null

  return (
    <BSPagination className="justify-content-center mt-4">
      <BSPagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
      {renderPageNumbers()}
      <BSPagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
    </BSPagination>
  )
}

export default Pagination

