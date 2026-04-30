import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex flex-1">
        <Sidebar drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
