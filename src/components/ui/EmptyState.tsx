import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      <Icon aria-hidden className="w-12 h-12 text-fg/40 mb-4" />
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-fg/70 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
