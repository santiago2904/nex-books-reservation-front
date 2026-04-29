import { Badge } from '@/components/ui'

export function AvailabilityBadge({ available, total }: { available: number; total: number }) {
  if (available === 0) return <Badge tone="red">Sin ejemplares</Badge>
  if (available < total) return <Badge tone="blue">{available} de {total} disponibles</Badge>
  return <Badge tone="green">{total} disponibles</Badge>
}
