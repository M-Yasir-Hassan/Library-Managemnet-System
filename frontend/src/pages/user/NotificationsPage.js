"use client"

import { useEffect } from "react"
import { Card, Button, ListGroup, Badge } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaBell, FaCheck, FaTrash } from "react-icons/fa"
import Loader from "../../components/common/Loader"
import Pagination from "../../components/common/Pagination"
import { useNotification } from "../../contexts/NotificationContext"
import moment from "moment"

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    pagination,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
  } = useNotification()

  useEffect(() => {
    getNotifications()
  }, [getNotifications])

  const handlePageChange = (page) => {
    getNotifications({ page })
  }

  const handleMarkAsRead = async (id) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleDeleteNotification = async (id) => {
    await deleteNotification(id)
  }

  const handleDeleteReadNotifications = async () => {
    await deleteReadNotifications()
  }

  const getNotificationLink = (notification) => {
    const { type, referenceId } = notification

    switch (type) {
      case "book_available":
      case "book_review":
        return `/books/${referenceId}`
      case "borrow_due":
      case "borrow_overdue":
        return "/borrowed-books"
      case "community_post":
      case "community_invitation":
        return `/communities/${referenceId}`
      default:
        return "#"
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Notifications</h1>
        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={handleMarkAllAsRead}
            disabled={loading || notifications.every((n) => n.isRead)}
          >
            <FaCheck className="me-2" /> Mark All as Read
          </Button>
          <Button
            variant="outline-danger"
            onClick={handleDeleteReadNotifications}
            disabled={loading || !notifications.some((n) => n.isRead)}
          >
            <FaTrash className="me-2" /> Delete Read
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {notifications.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <FaBell className="text-muted mb-3" size={40} />
                <h4>No notifications</h4>
                <p>You don't have any notifications at the moment.</p>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <ListGroup variant="flush">
                {notifications.map((notification) => (
                  <ListGroup.Item key={notification._id} className={notification.isRead ? "" : "notification-unread"}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="me-3">
                        <Link
                          to={getNotificationLink(notification)}
                          className="text-decoration-none"
                          onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                        >
                          <h5>
                            {notification.title}
                            {!notification.isRead && (
                              <Badge bg="danger" pill className="ms-2">
                                New
                              </Badge>
                            )}
                          </h5>
                          <p className="mb-1">{notification.message}</p>
                          <small className="text-muted">{moment(notification.createdAt).fromNow()}</small>
                        </Link>
                      </div>
                      <div className="d-flex">
                        {!notification.isRead && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            <FaCheck />
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification._id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
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
          )}
        </>
      )}
    </div>
  )
}

export default NotificationsPage

