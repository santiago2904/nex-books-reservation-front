import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { ForbiddenView } from '@/components/layout/ForbiddenView'

export function ProtectedRoute({ role }: { role?: 'USER' | 'ADMIN' }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }
  if (role === 'ADMIN' && user?.role !== 'ADMIN') {
    return <ForbiddenView />
  }
  return <Outlet />
}
