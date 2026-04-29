import { NavLink } from 'react-router-dom'
import { BookOpen, ListChecks, Library, ClipboardList, UserPlus, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'

interface Item { to: string; label: string; icon: LucideIcon; adminOnly?: boolean }

const items: Item[] = [
  { to: '/', label: 'Libros', icon: BookOpen },
  { to: '/my-reservations', label: 'Mis reservas', icon: ListChecks },
  { to: '/admin/books', label: 'Catálogo', icon: Library, adminOnly: true },
  { to: '/admin/reservations', label: 'Reservas', icon: ClipboardList, adminOnly: true },
  { to: '/admin/users/new', label: 'Crear usuario', icon: UserPlus, adminOnly: true },
]

export function NavMenu({ onItemClick }: { onItemClick?: () => void }) {
  const { isAdmin, isAuthenticated } = useAuth()
  const visible = items.filter((i) => (i.adminOnly ? isAdmin : isAuthenticated || i.to === '/'))
  return (
    <nav className="flex flex-col py-2">
      {visible.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 text-sm border-l-2 transition-colors
             ${isActive ? 'bg-muted text-primary border-primary font-medium' : 'border-transparent text-fg hover:bg-muted'}`
          }
        >
          <Icon aria-hidden className="w-4 h-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
