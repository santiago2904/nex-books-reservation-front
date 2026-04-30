import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setStoredToken, getStoredToken } from '@/graphql/client'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

interface AuthContextShape {
  user: AuthUser | null
  accessToken: string | null
  isAdmin: boolean
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextShape | null>(null)

const USER_KEY = 'auth.user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => getStoredToken(),
  )
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    try {
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  })

  const login = useCallback((token: string, u: AuthUser) => {
    setStoredToken(token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setAccessToken(token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    localStorage.removeItem(USER_KEY)
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAdmin: user?.role === 'ADMIN',
      isAuthenticated: !!accessToken,
      login,
      logout,
    }),
    [user, accessToken, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
