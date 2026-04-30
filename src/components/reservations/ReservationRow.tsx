import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, CheckCircle2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui'

interface Reservation {
  id: string
  status: string
  reservedAt: string
  dueDate: string
  returnedAt: string | null
  bookCopy: {
    code: string
    book: { id: string; title: string; author: string; isbn?: string | null }
  }
}

function MiniCover({ isbn, title }: { isbn?: string | null; title: string }) {
  const [err, setErr] = useState(false)
  const initials = title.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  const src = isbn && !err ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null

  if (src) {
    return (
      <img
        src={src}
        alt={`Portada de ${title}`}
        onError={() => setErr(true)}
        loading="lazy"
        width={64}
        height={96}
        className="w-full h-full object-cover"
      />
    )
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-slate-50 to-slate-100">
      <span className="text-lg font-serif font-semibold text-slate-300">{initials}</span>
      <BookOpen aria-hidden className="w-4 h-4 text-slate-200" />
    </div>
  )
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
      bg-surface rounded-xl border overflow-hidden shadow-sm
      transition-all duration-200 hover:shadow-md
      ${isActive ? 'border-border' : 'border-border/40'}
      ${!isActive ? 'opacity-60' : ''}
    `}>
      <div className="flex gap-0">
        {/* cover thumbnail */}
        <div className="w-16 shrink-0 bg-slate-100 overflow-hidden">
          <div className="h-full min-h-[96px]">
            <MiniCover isbn={r.bookCopy.book.isbn} title={r.bookCopy.book.title} />
          </div>
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-fg leading-tight mb-0.5 line-clamp-1">
                {r.bookCopy.book.title}
              </h3>
              <p className="text-xs text-fg/50 line-clamp-1">{r.bookCopy.book.author}</p>
            </div>
            {/* status badge */}
            <span className={`
              inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0
              ${isActive
                ? isOverdue
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-emerald-50 text-emerald-700'
                : 'bg-muted text-fg/40'
              }
            `}>
              {isActive
                ? isOverdue
                  ? <><Clock aria-hidden className="w-3 h-3" />Vencida</>
                  : <><CheckCircle2 aria-hidden className="w-3 h-3" />Activa</>
                : <><CheckCircle2 aria-hidden className="w-3 h-3" />Devuelta</>
              }
            </span>
          </div>

          {/* dates + action */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-fg/40">
              <span className="flex items-center gap-1">
                <Calendar aria-hidden className="w-3 h-3" />
                {format(new Date(r.reservedAt), 'dd MMM yyyy')}
              </span>
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : ''}`}>
                <Clock aria-hidden className="w-3 h-3" />
                Vence {format(dueDate, 'dd MMM yyyy')}
              </span>
              {r.returnedAt && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 aria-hidden className="w-3 h-3" />
                  {format(new Date(r.returnedAt), 'dd MMM yyyy')}
                </span>
              )}
            </div>
            {isActive && onReturn && (
              <Button
                variant="secondary"
                onClick={() => onReturn(r.id)}
                className="text-xs py-1.5 px-3 h-auto min-h-0 shrink-0"
              >
                Devolver
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
