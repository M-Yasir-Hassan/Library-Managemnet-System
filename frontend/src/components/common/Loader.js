import { Spinner } from "react-bootstrap"

const Loader = ({ size = "md", variant = "primary", text = "Loading..." }) => {
  return (
    <div className="text-center my-5 py-5">
      <div className="d-inline-block position-relative">
        <Spinner animation="border" role="status" variant={variant} size={size} className="loading-spinner">
          <span className="visually-hidden">{text}</span>
        </Spinner>
        <Spinner
          animation="grow"
          role="status"
          variant={variant}
          size={size === "sm" ? "sm" : undefined}
          className="position-absolute top-0 start-0 opacity-50"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="visually-hidden">{text}</span>
        </Spinner>
      </div>
      <p className="mt-3 text-muted">{text}</p>
    </div>
  )
}

export default Loader

