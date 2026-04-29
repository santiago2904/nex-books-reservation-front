import { Lock } from 'lucide-react'

export function ForbiddenView() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Lock aria-hidden className="w-12 h-12 text-fg/40 mb-4" />
      <h2 className="text-2xl mb-2">Sin permisos</h2>
      <p className="text-fg/70 max-w-md">
        No tienes acceso a esta sección. Contacta a un administrador si crees que esto es un error.
      </p>
    </div>
  )
}
