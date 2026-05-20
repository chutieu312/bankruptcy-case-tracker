import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthState } from '@/types'
import { authApi } from '@/api'

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    token: localStorage.getItem('token'),
    fullName: localStorage.getItem('fullName'),
    role: localStorage.getItem('role'),
  })

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('fullName', data.fullName)
    localStorage.setItem('role', data.role)
    setAuth({ token: data.token, fullName: data.fullName, role: data.role })
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setAuth({ token: null, fullName: null, role: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
