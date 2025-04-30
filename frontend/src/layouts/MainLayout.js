"use client"

import { Outlet } from "react-router-dom"
import Header from "../components/common/Header"
import Footer from "../components/common/Footer"
import { Container } from "react-bootstrap"
import { useEffect } from "react"

const MainLayout = () => {
  // Add smooth scroll behavior
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100 main-layout">
      <Header />
      <main className="flex-grow-1 py-4 main-content">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout

