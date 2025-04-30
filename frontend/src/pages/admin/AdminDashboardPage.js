"use client"

import { useEffect, useState } from "react"
import { Row, Col, Card } from "react-bootstrap"
import { FaBook, FaUsers, FaExchangeAlt, FaUsersCog } from "react-icons/fa"
import { Link } from "react-router-dom"
import Loader from "../../components/common/Loader"
import { getBooks } from "../../services/bookService"
import { getUsers, getUserStats } from "../../services/userService"
import { getTransactions } from "../../services/transactionService"
import { getCommunities } from "../../services/communityService"

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    books: 0,
    users: 0,
    transactions: 0,
    communities: 0,
    recentBooks: [],
    recentTransactions: [],
    userStats: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Fetch counts and recent items
        const [booksRes, usersRes, transactionsRes, communitiesRes, userStatsRes] = await Promise.all([
          getBooks({ pageSize: 5, sort: "-createdAt" }),
          getUsers({ pageSize: 5, sort: "-createdAt" }),
          getTransactions({ pageSize: 5, sort: "-createdAt" }),
          getCommunities({ pageSize: 5 }),
          getUserStats(),
        ])

        setStats({
          books: booksRes.total || 0,
          users: usersRes.total || 0,
          transactions: transactionsRes.total || 0,
          communities: communitiesRes.total || 0,
          recentBooks: booksRes.books || [],
          recentTransactions: transactionsRes.transactions || [],
          userStats: userStatsRes.stats || null,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaBook className="display-4 text-primary mb-2" />
              <h2>{stats.books}</h2>
              <Card.Title>Total Books</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/admin/books" className="btn btn-sm btn-outline-primary w-100">
                View All
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaUsers className="display-4 text-success mb-2" />
              <h2>{stats.users}</h2>
              <Card.Title>Total Users</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/admin/users" className="btn btn-sm btn-outline-success w-100">
                View All
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaExchangeAlt className="display-4 text-warning mb-2" />
              <h2>{stats.transactions}</h2>
              <Card.Title>Transactions</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/admin/transactions" className="btn btn-sm btn-outline-warning w-100">
                View All
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaUsersCog className="display-4 text-info mb-2" />
              <h2>{stats.communities}</h2>
              <Card.Title>Communities</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Link to="/admin/communities" className="btn btn-sm btn-outline-info w-100">
                View All
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Recent Books */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Recently Added Books</h5>
        </Card.Header>
        <Card.Body>
          {stats.recentBooks.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBooks.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.ISBN}</td>
                      <td>
                        <span className={`badge ${book.availableCopies > 0 ? "bg-success" : "bg-danger"}`}>
                          {book.availableCopies > 0 ? `${book.availableCopies} copies` : "Out of stock"}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/books/edit/${book._id}`} className="btn btn-sm btn-outline-primary me-2">
                          Edit
                        </Link>
                        <Link to={`/books/${book._id}`} className="btn btn-sm btn-outline-secondary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">No books found</p>
          )}
        </Card.Body>
        <Card.Footer>
          <Link to="/admin/books" className="btn btn-sm btn-outline-primary">
            View All Books
          </Link>
        </Card.Footer>
      </Card>

      {/* Recent Transactions */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Recent Transactions</h5>
        </Card.Header>
        <Card.Body>
          {stats.recentTransactions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Book</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{transaction.user?.name || "Unknown"}</td>
                      <td>{transaction.book?.title || "Unknown"}</td>
                      <td>
                        <span
                          className={`badge ${transaction.type === "borrow" ? "badge-borrowing" : "badge-purchase"}`}
                        >
                          {transaction.type === "borrow" ? "Borrow" : "Purchase"}
                        </span>
                      </td>
                      <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            transaction.status === "completed"
                              ? "bg-success"
                              : transaction.status === "pending"
                                ? "bg-warning"
                                : "bg-danger"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">No transactions found</p>
          )}
        </Card.Body>
        <Card.Footer>
          <Link to="/admin/transactions" className="btn btn-sm btn-outline-primary">
            View All Transactions
          </Link>
        </Card.Footer>
      </Card>

      {/* User Stats */}
      {stats.userStats && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">User Statistics</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h3>{stats.userStats.activeUsers || 0}</h3>
                    <p>Active Users</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h3>{stats.userStats.newUsersThisMonth || 0}</h3>
                    <p>New Users This Month</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center">
                  <Card.Body>
                    <h3>{stats.userStats.totalBorrowings || 0}</h3>
                    <p>Total Borrowings</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default AdminDashboardPage

