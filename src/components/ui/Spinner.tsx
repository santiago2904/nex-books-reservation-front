import { Loader2 } from 'lucide-react'

export function Spinner({ size = 24 }: { size?: number }) {
  return <Loader2 aria-hidden className="animate-spin text-fg/60" width={size} height={size} />
}
