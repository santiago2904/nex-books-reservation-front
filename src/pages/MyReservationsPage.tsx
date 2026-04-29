import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { ListChecks } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Spinner } from '@/components/ui'
import { ReservationRow } from '@/components/reservations/ReservationRow'
import { ReturnConfirmModal } from '@/components/reservations/ReturnConfirmModal'

const MY = gql`
  query MyReservations($filters: ReservationFiltersInput) {
    myReservations(filters: $filters) {
      id status reservedAt dueDate returnedAt
      bookCopy { id code book { id title author } }
    }
  }
`

interface Reservation {
  id: string
  status: string
  reservedAt: string
  dueDate: string
  returnedAt: string | null
  bookCopy: { id: string; code: string; book: { id: string; title: string; author: string } }
}

export function MyReservationsPage() {
  const { data, loading, error, refetch } = useQuery<{ myReservations: Reservation[] }>(MY)
  const [returning, setReturning] = useState<Reservation | null>(null)

  if (loading && !data) {
    return <div className="py-12 flex justify-center"><Spinner /></div>
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive mb-4">No se pudieron cargar tus reservas.</p>
        <Button onClick={() => void refetch()}>Reintentar</Button>
      </div>
    )
  }

  const reservations = data?.myReservations ?? []

  return (
    <section>
      <h1 className="text-3xl mb-6">Mis reservas</h1>
      {reservations.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Aún no tienes reservas"
          description="Explora el catálogo y reserva un libro para empezar."
          action={<Link to="/" className="text-primary hover:underline">Ir al catálogo →</Link>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {reservations.map((r) => (
            <ReservationRow key={r.id} reservation={r} onReturn={() => setReturning(r)} />
          ))}
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
