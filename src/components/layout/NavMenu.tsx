import { NavLink } from 'react-router-dom'
import { BookOpen, ListChecks, Library, ClipboardList, UserPlus, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'

interface Item { to: string; label: string; icon: LucideIcon; adminOnly?: boolean }

const mainItems: Item[] = [
  { to: '/', label: 'Catálogo', icon: BookOpen },
  { to: '/my-reservations', label: 'Mis reservas', icon: ListChecks },
]
const adminItems: Item[] = [
  { to: '/admin/books', label: 'Gestión de libros', icon: Library },
  { to: '/admin/reservations', label: 'Reservas', icon: ClipboardList },
  { to: '/admin/users/new', label: 'Crear usuario', icon: UserPlus },
]

function NavItem({ to, label, icon: Icon, onClick }: Item & { onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 mx-2 py-2.5 rounded-lg text-sm transition-colors
         focus:outline focus:outline-2 focus:outline-ring
         ${isActive
           ? 'bg-primary/8 text-primary font-medium'
           : 'text-fg/60 hover:bg-muted hover:text-fg'
         }`
      }
    >
      <Icon aria-hidden className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export function NavMenu({ onItemClick }: { onItemClick?: () => void }) {
  const { isAdmin, isAuthenticated } = useAuth()

  return (
    <nav className="py-4 space-y-0.5">
      {mainItems
        .filter((i) => isAuthenticated || i.to === '/')
        .map((item) => <NavItem key={item.to} {...item} onClick={onItemClick} />)
      }

      {isAdmin && (
        <>
          <div className="mx-4 my-3 flex items-center gap-2">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs font-medium text-fg/30 uppercase tracking-wider">Admin</span>
            <div className="flex-1 border-t border-border" />
          </div>
          {adminItems.map((item) => <NavItem key={item.to} {...item} onClick={onItemClick} />)}
        </>
      )}
    </nav>
  )
}
