import { format } from 'date-fns'
import { Calendar, Clock, CheckCircle2, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui'

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
  reservation: r,
  onReturn,
}: {
  reservation: Reservation
  onReturn?: (id: string) => void
}) {
  const isActive = r.status === 'ACTIVE'
  const dueDate = new Date(r.dueDate)
  const isOverdue = isActive && dueDate < new Date()

  return (
    <article className={`
      bg-surface rounded-xl border overflow-hidden
      transition-shadow hover:shadow-md
      ${isActive ? 'border-border' : 'border-border/50 opacity-75'}
    `}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
        {/* book icon placeholder */}
        <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
          <BookMarked aria-hidden className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          {/* title + status */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-serif font-semibold text-fg leading-tight truncate">
              {r.bookCopy.book.title}
            </h3>
            <span className={`
              inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
              ${isActive
                ? isOverdue
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
                : 'bg-muted text-fg/50'
              }
            `}>
              {isActive ? (
                <><Clock aria-hidden className="w-3 h-3" />{isOverdue ? 'Vencida' : 'Activa'}</>
              ) : (
                <><CheckCircle2 aria-hidden className="w-3 h-3" />Devuelta</>
              )}
            </span>
          </div>

          <p className="text-sm text-fg/50 mb-2">{r.bookCopy.book.author} · ejemplar {r.bookCopy.code}</p>

          {/* dates */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg/40">
            <span className="flex items-center gap-1">
              <Calendar aria-hidden className="w-3 h-3" />
              Reservada {format(new Date(r.reservedAt), 'dd MMM yyyy')}
            </span>
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
              <Clock aria-hidden className="w-3 h-3" />
              Vence {format(dueDate, 'dd MMM yyyy')}
            </span>
            {r.returnedAt && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 aria-hidden className="w-3 h-3" />
                Devuelta {format(new Date(r.returnedAt), 'dd MMM yyyy')}
              </span>
            )}
          </div>
        </div>

        {isActive && onReturn && (
          <Button
            variant="secondary"
            onClick={() => onReturn(r.id)}
            className="shrink-0 text-sm"
          >
            Devolver
          </Button>
        )}
      </div>
    </article>
  )
}
