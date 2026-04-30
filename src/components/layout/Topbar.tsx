import { Menu, LogOut, BookOpen } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { Link, useNavigate } from 'react-router-dom'

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, isAuthenticated, logout } = useAuth()
  const nav = useNavigate()

  const handleLogout = () => { logout(); nav('/login') }
  const initials = user?.name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() ?? '?'

  return (
    <header className="bg-surface border-b border-border h-16 flex items-center px-4 sm:px-6 gap-4">
      <button
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors focus:outline focus:outline-2 focus:outline-ring"
      >
        <Menu aria-hidden className="w-5 h-5 text-fg/60" />
      </button>

      <Link
        to="/"
        className="flex items-center gap-2.5 focus:outline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded-sm"
      >
        <div className="w-8 h-8 rounded-lg bg-fg flex items-center justify-center">
          <BookOpen aria-hidden className="w-4 h-4 text-surface" />
        </div>
        <span className="font-serif text-xl font-semibold tracking-tight hidden sm:inline">Nex Books</span>
      </Link>

      <div className="flex-1" />

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          {/* avatar */}
          <div
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
            aria-hidden
          >
            <span className="text-xs font-semibold text-primary">{initials}</span>
          </div>
          <span className="text-sm text-fg/60 hidden md:inline max-w-[160px] truncate">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm text-fg/60 hover:text-fg transition-colors cursor-pointer focus:outline focus:outline-2 focus:outline-ring rounded px-1 py-1"
          >
            <LogOut aria-hidden className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="text-sm font-medium text-fg/70 hover:text-fg transition-colors focus:outline focus:outline-2 focus:outline-ring rounded px-2 py-1"
        >
          Iniciar sesión
        </Link>
      )}
    </header>
  )
}
