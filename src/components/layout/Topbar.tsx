import { Menu, LogOut, BookOpen } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { Link, useNavigate } from 'react-router-dom'

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, isAuthenticated, logout } = useAuth()
  const nav = useNavigate()

  const handleLogout = () => { logout(); nav('/login') }

  return (
    <header className="bg-surface border-b border-border h-14 flex items-center px-4 gap-4">
      <button onClick={onMenuClick} aria-label="Abrir menú" className="lg:hidden p-2 rounded hover:bg-muted">
        <Menu aria-hidden className="w-5 h-5" />
      </button>
      <Link to="/" className="flex items-center gap-2 font-serif text-xl">
        <BookOpen aria-hidden className="w-6 h-6 text-primary" />
        Nex Books
      </Link>
      <div className="flex-1" />
      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-fg/70 hidden sm:inline">{user?.email}</span>
          <button onClick={handleLogout} className="inline-flex items-center gap-1 text-sm hover:text-primary cursor-pointer">
            <LogOut aria-hidden className="w-4 h-4" /> Salir
          </button>
        </div>
      ) : (
        <Link to="/login" className="text-sm hover:text-primary">Iniciar sesión</Link>
      )}
    </header>
  )
}
