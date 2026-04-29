import { X } from 'lucide-react'
import { NavMenu } from './NavMenu'

export function Sidebar({ drawerOpen, onCloseDrawer }: { drawerOpen: boolean; onCloseDrawer: () => void }) {
  return (
    <>
      <aside className="hidden lg:block w-60 border-r border-border bg-surface min-h-[calc(100vh-3.5rem)]">
        <NavMenu />
      </aside>
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={onCloseDrawer}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <aside className="bg-surface w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="h-14 flex items-center justify-end px-4 border-b border-border">
              <button aria-label="Cerrar menú" onClick={onCloseDrawer} className="p-2 rounded hover:bg-muted">
                <X aria-hidden className="w-5 h-5" />
              </button>
            </div>
            <NavMenu onItemClick={onCloseDrawer} />
          </aside>
        </div>
      )}
    </>
  )
}
