"use client"

import { useEffect, useState } from "react"
import { Card, Button, Table, Form, Row, Col, Badge, Modal } from "react-bootstrap"
import { FaSearch, FaEye } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import { getTransactions, getTransactionById } from "../../services/transactionService"
import { toast } from "react-toastify"
import moment from "moment"

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    sort: "-createdAt",
  })

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        search: searchTerm,
        ...filters,
      }
      const response = await getTransactions(params)
      if (response.success) {
        setTransactions(response.transactions)
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total,
        })
      }
    } catch (error) {
      toast.error("Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTransactions()
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleViewDetails = async (transactionId) => {
    try {
      const response = await getTransactionById(transactionId)
      if (response.success) {
        setSelectedTransaction(response.transaction)
        setShowDetailsModal(true)
      }
    } catch (error) {
      toast.error("Failed to fetch transaction details")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge bg="success">Completed</Badge>
      case "pending":
        return <Badge bg="warning">Pending</Badge>
      case "overdue":
        return <Badge bg="danger">Overdue</Badge>
      case "cancelled":
        return <Badge bg="secondary">Cancelled</Badge>
      default:
        return <Badge bg="info">{status}</Badge>
    }
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case "borrow":
        return <Badge bg="primary">Borrow</Badge>
      case "return":
        return <Badge bg="info">Return</Badge>
      case "purchase":
        return <Badge bg="success">Purchase</Badge>
      default:
        return <Badge bg="secondary">{type}</Badge>
    }
  }

  return (
    <div>
      <h1 className="mb-4">Manage Transactions</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search by user, book, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch />
                  </Button>
                </div>
              </Form>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                      <option value="">All Types</option>
                      <option value="borrow">Borrow</option>
                      <option value="return">Return</option>
                      <option value="purchase">Purchase</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                      <option value="">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Select name="sort" value={filters.sort} onChange={handleFilterChange}>
                      <option value="-createdAt">Newest</option>
                      <option value="createdAt">Oldest</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Loader />
      ) : (
        <>
          <Card>
            <Card.Body>
              {transactions.length === 0 ? (
                <div className="text-center py-4">
                  <h4>No transactions found</h4>
                  <p>Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Book</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>{transaction._id.substring(0, 8)}...</td>
                          <td>{transaction.user?.name || "Unknown"}</td>
                          <td>{transaction.book?.title || "Unknown"}</td>
                          <td>{getTypeBadge(transaction.type)}</td>
                          <td>{moment(transaction.createdAt).format("MMM D, YYYY")}</td>
                          <td>{getStatusBadge(transaction.status)}</td>
                          <td>
                            <Button variant="info" size="sm" onClick={() => handleViewDetails(transaction._id)}>
                              <FaEye />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
            {pagination.pages > 1 && (
              <Card.Footer>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </Card.Footer>
            )}
          </Card>
        </>
      )}

      {/* Transaction Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Transaction ID:</strong> {selectedTransaction._id}
                  </p>
                  <p>
                    <strong>Type:</strong> {getTypeBadge(selectedTransaction.type)}
                  </p>
                  <p>
                    <strong>Status:</strong> {getStatusBadge(selectedTransaction.status)}
                  </p>
                  <p>
                    <strong>Date:</strong> {moment(selectedTransaction.createdAt).format("MMMM D, YYYY, h:mm a")}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>User:</strong> {selectedTransaction.user?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedTransaction.user?.email || "Unknown"}
                  </p>
                  <p>
                    <strong>Book:</strong> {selectedTransaction.book?.title || "Unknown"}
                  </p>
                  <p>
                    <strong>ISBN:</strong> {selectedTransaction.book?.ISBN || "Unknown"}
                  </p>
                </Col>
              </Row>

              {selectedTransaction.type === "borrow" && (
                <div className="mb-3">
                  <h5>Borrowing Details</h5>
                  <p>
                    <strong>Due Date:</strong> {moment(selectedTransaction.dueDate).format("MMMM D, YYYY")}
                  </p>
                  <p>
                    <strong>Days Remaining:</strong>{" "}
                    {moment(selectedTransaction.dueDate).diff(moment(), "days") >= 0
                      ? moment(selectedTransaction.dueDate).diff(moment(), "days")
                      : "Overdue"}
                  </p>
                </div>
              )}

              {selectedTransaction.type === "purchase" && (
                <div className="mb-3">
                  <h5>Purchase Details</h5>
                  <p>
                    <strong>Amount:</strong> ${selectedTransaction.amount?.toFixed(2) || "N/A"}
                  </p>
                  <p>
                    <strong>Payment Method:</strong> {selectedTransaction.paymentMethod || "N/A"}
                  </p>
                </div>
              )}

              {selectedTransaction.notes && (
                <div className="mb-3">
                  <h5>Notes</h5>
                  <p>{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AdminTransactionsPage

