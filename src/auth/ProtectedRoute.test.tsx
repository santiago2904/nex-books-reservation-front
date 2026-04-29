import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

function renderAt(path: string, role?: 'USER' | 'ADMIN', authedRole?: 'USER' | 'ADMIN') {
  if (authedRole) {
    localStorage.setItem('auth.token', 'tok')
    localStorage.setItem('auth.user', JSON.stringify({
      id: '1', name: 'X', email: 'x@x.t', role: authedRole, createdAt: new Date().toISOString(),
    }))
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>LOGIN</div>} />
          <Route element={<ProtectedRoute role={role} />}>
            <Route path="/secret" element={<div>SECRET</div>} />
            <Route path="/admin" element={<div>ADMIN</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear())

  it('redirects to /login when no session', () => {
    renderAt('/secret')
    expect(screen.getByText('LOGIN')).toBeInTheDocument()
  })

  it('renders children when authed and no role required', () => {
    renderAt('/secret', undefined, 'USER')
    expect(screen.getByText('SECRET')).toBeInTheDocument()
  })

  it('renders 403 when role insufficient', () => {
    renderAt('/admin', 'ADMIN', 'USER')
    expect(screen.getByText(/sin permisos/i)).toBeInTheDocument()
  })

  it('renders children when role matches', () => {
    renderAt('/admin', 'ADMIN', 'ADMIN')
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })
})
