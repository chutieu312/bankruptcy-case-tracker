import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
import CasesPage from '@/pages/CasesPage'
import CaseDetailPage from '@/pages/CaseDetailPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout><CasesPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <ProtectedRoute>
                <Layout><CaseDetailPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
