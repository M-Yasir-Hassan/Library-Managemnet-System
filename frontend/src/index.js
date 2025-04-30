import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { BookProvider } from "./contexts/BookContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import "bootstrap/dist/css/bootstrap.min.css"
import "react-toastify/dist/ReactToastify.css"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BookProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </BookProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

reportWebVitals()

