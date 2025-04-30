import { Card, Badge } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaStar } from "react-icons/fa"

const BookCard = ({ book }) => {
  return (
    <Card className="h-100 book-card">
      <div className="position-relative overflow-hidden">
        <Card.Img
          variant="top"
          src={book.coverImage ? `/${book.coverImage}` : "/placeholder.jpg"}
          alt={book.title}
          className="book-cover"
        />
        {book.featured && (
          <div className="position-absolute top-0 end-0 m-2">
            <Badge className="featured-badge">Featured</Badge>
          </div>
        )}
      </div>
      <Card.Body>
        <Card.Title className="text-truncate">{book.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted text-truncate">{book.author}</Card.Subtitle>
        <div className="d-flex align-items-center mb-2">
          <FaStar className="text-warning me-1" />
          <span>{book.rating.toFixed(1)}</span>
          <span className="text-muted ms-1">({book.reviews.length} reviews)</span>
        </div>
        <div className="mb-2">
          {book.genre.slice(0, 3).map((g, index) => (
            <Badge bg="secondary" className="me-1 mb-1" key={index}>
              {g}
            </Badge>
          ))}
        </div>
        <Card.Text className="text-truncate mb-3">{book.description}</Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <Badge bg={book.availableCopies > 0 ? "success" : "danger"} className="availability-badge">
            {book.availableCopies > 0 ? "Available" : "Unavailable"}
          </Badge>
          <span className="price-tag">${book.price.toFixed(2)}</span>
        </div>
      </Card.Body>
      <Card.Footer className="bg-white border-top-0 d-flex gap-2">
        <Link to={`/books/${book._id}`} className="btn btn-primary w-100">
          View Details
        </Link>
      </Card.Footer>
    </Card>
  )
}

export default BookCard

