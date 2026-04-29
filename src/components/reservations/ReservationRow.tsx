import { format } from 'date-fns'
import { Badge, Button } from '@/components/ui'

interface Reservation {
  id: string
  status: string
  reservedAt: string
  dueDate: string
  returnedAt: string | null
  bookCopy: {
    code: string
    book: { id: string; title: string; author: string }
  }
}

export function ReservationRow({
  reservation,
  onReturn,
}: {
  reservation: Reservation
  onReturn?: (id: string) => void
}) {
  const r = reservation
  return (
    <div className="bg-surface border border-border rounded p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg">{r.bookCopy.book.title}</h3>
          {r.status === 'ACTIVE'
            ? <Badge tone="blue">Activa</Badge>
            : <Badge tone="slate">Devuelta</Badge>}
        </div>
        <p className="text-sm text-fg/70">
          {r.bookCopy.book.author} · Ejemplar {r.bookCopy.code}
        </p>
        <p className="text-xs text-fg/60 tabular mt-1">
          Reservada: {format(new Date(r.reservedAt), 'yyyy-MM-dd')} · Vence:{' '}
          {format(new Date(r.dueDate), 'yyyy-MM-dd')}
          {r.returnedAt && ` · Devuelta: ${format(new Date(r.returnedAt), 'yyyy-MM-dd')}`}
        </p>
      </div>
      {r.status === 'ACTIVE' && onReturn && (
        <Button variant="secondary" onClick={() => onReturn(r.id)}>
          Devolver
        </Button>
      )}
    </div>
  )
}
