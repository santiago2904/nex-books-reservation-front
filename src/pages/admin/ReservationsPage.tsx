import { useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useSearchParams } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { ReservationRow } from '@/components/reservations/ReservationRow'
import { ReservationFilters } from '@/components/reservations/ReservationFilters'

const BY_BOOK = gql`
  query ReservationsByBook($bookId: ID!, $filters: ReservationFiltersInput) {
    reservationsByBook(bookId: $bookId, filters: $filters) {
      id status reservedAt dueDate returnedAt
      bookCopy { id code book { id title author } }
    }
  }
`
const BY_USER = gql`
  query ReservationsByUser($userId: ID!, $filters: ReservationFiltersInput) {
    reservationsByUser(userId: $userId, filters: $filters) {
      id status reservedAt dueDate returnedAt
      bookCopy { id code book { id title author } }
    }
  }
`

interface Reservation {
  id: string; status: string; reservedAt: string; dueDate: string; returnedAt: string | null
  bookCopy: { id: string; code: string; book: { id: string; title: string; author: string } }
}

export function ReservationsPage() {
  const [params] = useSearchParams()
  const bookId = params.get('bookId') ?? ''
  const userId = params.get('userId') ?? ''
  const from = params.get('from') ?? undefined
  const to = params.get('to') ?? undefined
  const filters = useMemo(() => ({ from: from ? new Date(from).toISOString() : undefined, to: to ? new Date(to).toISOString() : undefined }), [from, to])

  const byBook = useQuery<{ reservationsByBook: Reservation[] }>(BY_BOOK, { variables: { bookId, filters }, skip: !bookId })
  const byUser = useQuery<{ reservationsByUser: Reservation[] }>(BY_USER, { variables: { userId, filters }, skip: !userId })

  const { loading, error } = bookId ? byBook : byUser
  const reservations = (bookId ? byBook.data?.reservationsByBook : byUser.data?.reservationsByUser) ?? []

  return (
    <section>
      <h1 className="text-3xl mb-4">Reservas</h1>
      <ReservationFilters />

      {!bookId && !userId && (
        <p className="text-fg/60 text-sm py-8 text-center">
          Ingresa un ID de libro o de usuario para ver sus reservas.
        </p>
      )}

      {(bookId || userId) && loading && <div className="py-8 flex justify-center"><Spinner /></div>}
      {(bookId || userId) && error && <p className="text-destructive text-sm">No se pudieron cargar las reservas.</p>}
      {(bookId || userId) && !loading && !error && reservations.length === 0 && (
        <p className="text-fg/60 text-sm">No hay reservas para los filtros seleccionados.</p>
      )}

      {reservations.length > 0 && (
        <div className="flex flex-col gap-3">
          {reservations.map((r) => <ReservationRow key={r.id} reservation={r} />)}
        </div>
      )}
    </section>
  )
}
