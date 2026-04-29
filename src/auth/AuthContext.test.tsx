import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { setStoredToken } from '@/graphql/client'

function Probe() {
  const { user, isAdmin, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <button onClick={() => login('tok-123', { id: '1', name: 'A', email: 'a@x.t', role: 'ADMIN', createdAt: new Date().toISOString() })}>L</button>
      <button onClick={logout}>O</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    setStoredToken(null)
    localStorage.clear()
  })

  it('starts with no user', () => {
    render(<AuthProvider><Probe /></AuthProvider>)
    expect(screen.getByTestId('email').textContent).toBe('none')
    expect(screen.getByTestId('admin').textContent).toBe('false')
  })

  it('login stores token and user; logout clears them', () => {
    render(<AuthProvider><Probe /></AuthProvider>)
    act(() => screen.getByText('L').click())
    expect(screen.getByTestId('email').textContent).toBe('a@x.t')
    expect(screen.getByTestId('admin').textContent).toBe('true')
    expect(localStorage.getItem('auth.token')).toBe('tok-123')
    act(() => screen.getByText('O').click())
    expect(screen.getByTestId('email').textContent).toBe('none')
    expect(localStorage.getItem('auth.token')).toBeNull()
  })
})
