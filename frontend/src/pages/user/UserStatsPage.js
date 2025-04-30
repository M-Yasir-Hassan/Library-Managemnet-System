"use client"

import { useEffect, useState } from "react"
import { Card, Row, Col, Table } from "react-bootstrap"
import { FaBook, FaShoppingCart, FaStar, FaUsers } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import { getUserStatistics } from "../../services/userService"
import { getUserBorrowedBooks } from "../../services/userService"
import { getUserPurchasedBooks } from "../../services/userService"
import { toast } from "react-toastify"
import moment from "moment"

const UserStatsPage = () => {
  const [stats, setStats] = useState(null)
  const [recentBorrowedBooks, setRecentBorrowedBooks] = useState([])
  const [recentPurchasedBooks, setRecentPurchasedBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true)

        // Fetch user statistics
        const statsResponse = await getUserStatistics()
        if (statsResponse.success) {
          setStats(statsResponse.stats)
        }

        // Fetch recent borrowed books
        const borrowedResponse = await getUserBorrowedBooks({ pageSize: 5, sort: "-borrowDate" })
        if (borrowedResponse.success) {
          setRecentBorrowedBooks(borrowedResponse.borrowedBooks || [])
        }

        // Fetch recent purchased books
        const purchasedResponse = await getUserPurchasedBooks({ pageSize: 5, sort: "-purchaseDate" })
        if (purchasedResponse.success) {
          setRecentPurchasedBooks(purchasedResponse.purchasedBooks || [])
        }
      } catch (error) {
        toast.error("Failed to fetch user statistics")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="mb-4">My Statistics</h1>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaBook className="display-4 text-primary mb-2" />
              <h2>{stats?.borrowedCount || 0}</h2>
              <Card.Title>Books Borrowed</Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaShoppingCart className="display-4 text-success mb-2" />
              <h2>{stats?.purchasedCount || 0}</h2>
              <Card.Title>Books Purchased</Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaStar className="display-4 text-warning mb-2" />
              <h2>{stats?.reviewCount || 0}</h2>
              <Card.Title>Reviews Written</Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaUsers className="display-4 text-info mb-2" />
              <h2>{stats?.communitiesCount || 0}</h2>
              <Card.Title>Communities Joined</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {recentBorrowedBooks.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Recently Borrowed Books</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrowed Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBorrowedBooks.map((item) => (
                  <tr key={item._id}>
                    <td>{item.book.title}</td>
                    <td>{moment(item.borrowDate).format("MMM D, YYYY")}</td>
                    <td>{moment(item.dueDate).format("MMM D, YYYY")}</td>
                    <td>
                      {item.status === "returned" ? (
                        <span className="badge bg-success">Returned</span>
                      ) : moment(item.dueDate).isBefore(moment()) ? (
                        <span className="badge bg-danger">Overdue</span>
                      ) : (
                        <span className="badge bg-primary">Borrowed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {recentPurchasedBooks.length > 0 && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">Recently Purchased Books</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Purchase Date</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchasedBooks.map((item) => (
                  <tr key={item._id}>
                    <td>{item.book.title}</td>
                    <td>{moment(item.purchaseDate).format("MMM D, YYYY")}</td>
                    <td>${item.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default UserStatsPage