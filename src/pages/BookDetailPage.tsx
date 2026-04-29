import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useParams, Link } from 'react-router-dom'
import { AvailabilityBadge } from '@/components/books/AvailabilityBadge'
import { ReserveBookModal } from '@/components/books/ReserveBookModal'
import { Button, Skeleton } from '@/components/ui'
import { useAuth } from '@/auth/useAuth'

const BOOK_BY_ID = gql`
  query BookById($id: ID!) {
    book(id: $id) {
      id title author isbn description
      totalCopies availableCopies
      copies { id code status }
    }
  }
`

interface BookDetail {
  id: string
  title: string
  author: string
  isbn?: string | null
  description?: string | null
  totalCopies: number
  availableCopies: number
  copies: { id: string; code: string; status: string }[]
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const { loading, error, data } = useQuery<{ book: BookDetail | null }>(BOOK_BY_ID, {
    variables: { id },
    skip: !id,
  })

  if (loading) {
    return (
      <section className="max-w-2xl">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-5 w-1/3 mb-6" />
        <Skeleton className="h-24 w-full" />
      </section>
    )
  }

  if (error || !data?.book) {
    return (
      <section className="py-12 text-center">
        <p className="text-destructive mb-4">No se pudo cargar el libro.</p>
        <Button onClick={() => window.history.back()} variant="secondary">Volver</Button>
      </section>
    )
  }

  const book = data.book
  const [reserveOpen, setReserveOpen] = useState(false)

  return (
    <section className="max-w-2xl">
      <h1 className="text-4xl mb-1">{book.title}</h1>
      <p className="text-fg/70 text-lg mb-4">{book.author}</p>
      {book.isbn && <p className="text-sm text-fg/60 mb-2">ISBN: {book.isbn}</p>}
      {book.description && <p className="mb-6 text-fg/80">{book.description}</p>}

      <div className="flex items-center gap-4 mb-6">
        <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} />
      </div>

      {isAuthenticated ? (
        <Button
          disabled={book.availableCopies === 0}
          onClick={() => setReserveOpen(true)}
        >
          {book.availableCopies === 0 ? 'Sin ejemplares disponibles' : 'Reservar'}
        </Button>
      ) : (
        <Link
          to={`/login?from=/books/${book.id}`}
          className="inline-flex items-center px-4 py-2 rounded bg-primary text-on-primary hover:opacity-90 font-medium"
        >
          Inicia sesión para reservar
        </Link>
      )}

      <ReserveBookModal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        book={book}
      />
    </section>
  )
}
