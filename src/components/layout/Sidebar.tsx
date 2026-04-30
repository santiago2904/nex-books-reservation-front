import { X, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NavMenu } from './NavMenu'

function SidebarBrand() {
  return (
    <div className="px-4 py-4 border-b border-border flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-fg flex items-center justify-center shrink-0">
        <BookOpen aria-hidden className="w-3.5 h-3.5 text-surface" />
      </div>
      <Link to="/" className="font-serif text-lg font-semibold tracking-tight focus:outline focus:outline-2 focus:outline-ring rounded-sm">
        Nex Books
      </Link>
    </div>
  )
}

export function Sidebar({ drawerOpen, onCloseDrawer }: { drawerOpen: boolean; onCloseDrawer: () => void }) {
  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:flex lg:flex-col w-60 border-r border-border bg-surface min-h-[calc(100vh-4rem)]">
        <NavMenu />
      </aside>

      {/* mobile drawer */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={onCloseDrawer}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <aside
            className="bg-surface w-72 h-full shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border">
              <SidebarBrand />
              <button
                aria-label="Cerrar menú"
                onClick={onCloseDrawer}
                className="mr-3 p-2 rounded-lg hover:bg-muted transition-colors focus:outline focus:outline-2 focus:outline-ring"
              >
                <X aria-hidden className="w-4 h-4 text-fg/60" />
              </button>
            </div>
            <NavMenu onItemClick={onCloseDrawer} />
          </aside>
        </div>
      )}
    </>
  )
}
