import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { BookOpen } from 'lucide-react'
import { BookCard, BookCardSkeleton } from '@/components/books/BookCard'
import { EmptyState, Button } from '@/components/ui'

const BOOKS_LIST = gql`
  query BooksList {
    books { id title author isbn totalCopies availableCopies }
  }
`

interface Book {
  id: string
  title: string
  author: string
  isbn?: string | null
  totalCopies: number
  availableCopies: number
}

export function BooksListPage() {
  const { loading, error, data, refetch } = useQuery<{ books: Book[] }>(BOOKS_LIST)

  const books = data?.books ?? []

  return (
    <section>
      {/* header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif mb-1">Catálogo</h1>
        {!loading && !error && books.length > 0 && (
          <p className="text-fg/50 text-sm">{books.length} título{books.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      )}

      {/* error */}
      {error && (
        <div className="text-center py-12">
          <p className="mb-4 text-destructive text-sm">No se pudo cargar el catálogo.</p>
          <Button onClick={() => void refetch()}>Reintentar</Button>
        </div>
      )}

      {/* empty */}
      {!loading && !error && books.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Sin libros aún"
          description="No hay libros en el catálogo. Pídele a un administrador que añada algunos."
        />
      )}

      {/* grid */}
      {books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </section>
  )
}
