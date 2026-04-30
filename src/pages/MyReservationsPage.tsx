import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { ListChecks, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Skeleton } from '@/components/ui'
import { ReservationRow } from '@/components/reservations/ReservationRow'
import { ReturnConfirmModal } from '@/components/reservations/ReturnConfirmModal'

const MY = gql`
  query MyReservations($filters: ReservationFiltersInput) {
    myReservations(filters: $filters) {
      id status reservedAt dueDate returnedAt
      bookCopy { id code book { id title author isbn } }
    }
  }
`

interface Reservation {
  id: string
  status: string
  reservedAt: string
  dueDate: string
  returnedAt: string | null
  bookCopy: { id: string; code: string; book: { id: string; title: string; author: string; isbn?: string | null } }
}

function ReservationSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex gap-4">
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3 mt-1" />
      </div>
    </div>
  )
}

export function MyReservationsPage() {
  const { data, loading, error, refetch } = useQuery<{ myReservations: Reservation[] }>(MY)
  const [returning, setReturning] = useState<Reservation | null>(null)

  const reservations = data?.myReservations ?? []
  const active = reservations.filter((r) => r.status === 'ACTIVE')
  const returned = reservations.filter((r) => r.status !== 'ACTIVE')

  return (
    <section className="max-w-2xl">
      {/* header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-semibold mb-1">Mis reservas</h1>
        {!loading && !error && reservations.length > 0 && (
          <p className="text-fg/50 text-sm">
            {active.length} activa{active.length !== 1 ? 's' : ''}
            {returned.length > 0 && ` · ${returned.length} devuelta${returned.length !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {/* loading */}
      {loading && !data && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <ReservationSkeleton key={i} />)}
        </div>
      )}

      {/* error */}
      {error && (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-destructive text-sm mb-4">No se pudieron cargar tus reservas.</p>
          <Button variant="secondary" onClick={() => void refetch()}>Reintentar</Button>
        </div>
      )}

      {/* empty */}
      {!loading && !error && reservations.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <ListChecks aria-hidden className="w-8 h-8 text-fg/30" />
          </div>
          <div>
            <p className="font-serif text-xl font-medium text-fg mb-1">Sin reservas aún</p>
            <p className="text-fg/50 text-sm">Explora el catálogo y reserva un libro para empezar.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-2"
          >
            <BookOpen aria-hidden className="w-4 h-4" />
            Ver catálogo
          </Link>
        </div>
      )}

      {/* active reservations */}
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40 mb-3">Activas</h2>
          <div className="space-y-3">
            {active.map((r) => (
              <ReservationRow key={r.id} reservation={r} onReturn={() => setReturning(r)} />
            ))}
          </div>
        </div>
      )}

      {/* returned reservations */}
      {returned.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40 mb-3">Historial</h2>
          <div className="space-y-3">
            {returned.map((r) => (
              <ReservationRow key={r.id} reservation={r} />
            ))}
          </div>
        </div>
      )}

      <ReturnConfirmModal
        open={!!returning}
        onClose={() => setReturning(null)}
        reservation={returning}
        onSuccess={() => void refetch()}
      />
    </section>
  )
}
