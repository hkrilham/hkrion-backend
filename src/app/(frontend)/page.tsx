import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import Image from 'next/image'
import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <a href="/" className="logo-container">
          <Image
            src="/hkrion-logo-v2.svg"
            alt="HKRiON Logo"
            width={150}
            height={50}
            priority
            className="logo-img"
          />
        </a>
        <div className="nav-links">
          {!user ? (
            <a href={payloadConfig.routes.admin} className="btn btn-outline">
              Login to Admin
            </a>
          ) : (
            <a href={payloadConfig.routes.admin} className="btn btn-primary">
              Go to Dashboard
            </a>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <h1>
          The Operating System <br />
          for Your Business
        </h1>
        <p>
          HKRiON is the all-in-one solution for managing your Point of Sale, Inventory, and Customer
          Relationships. Built for speed, designed for growth.
        </p>

        <div className="hero-actions">
          {!user ? (
            <>
              <a href={payloadConfig.routes.admin} className="btn btn-primary">
                Get Started
              </a>
              <a
                href="https://payloadcms.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Documentation
              </a>
            </>
          ) : (
            <a href={payloadConfig.routes.admin} className="btn btn-primary">
              Launch Application
            </a>
          )}
        </div>

        {/* Features Grid */}
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <h3>Smart Inventory</h3>
            <p>
              Real-time tracking of your products across multiple locations with automated low-stock
              alerts.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3>Modern POS</h3>
            <p>
              A lightning-fast Point of Sale interface designed to process transactions in seconds,
              not minutes.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Financial Insights</h3>
            <p>
              Comprehensive reports and analytics to help you make data-driven decisions for your
              business.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} HKRiON. All rights reserved.</p>
      </footer>
    </div>
  )
}
