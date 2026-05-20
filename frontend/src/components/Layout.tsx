import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { fullName, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="text-base font-semibold text-gray-800 hover:text-blue-600">
            Bankruptcy Case Tracker
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{fullName} <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{role}</span></span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
