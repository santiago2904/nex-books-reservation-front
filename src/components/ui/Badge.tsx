import { type ReactNode } from 'react'

type Tone = 'green' | 'blue' | 'yellow' | 'slate' | 'red'

const tones: Record<Tone, string> = {
  green: 'bg-accent/15 text-accent',
  blue: 'bg-primary/15 text-primary',
  yellow: 'bg-yellow-100 text-yellow-800',
  slate: 'bg-muted text-fg/70',
  red: 'bg-destructive/15 text-destructive',
}

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
