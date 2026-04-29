import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { BookOpen } from 'lucide-react'
import { BookCard, BookCardSkeleton } from '@/components/books/BookCard'
import { EmptyState, Button } from '@/components/ui'

const BOOKS_LIST = gql`
  query BooksList {
    books { id title author totalCopies availableCopies }
  }
`

interface Book {
  id: string
  title: string
  author: string
  totalCopies: number
  availableCopies: number
}

export function BooksListPage() {
  const { loading, error, data, refetch } = useQuery<{ books: Book[] }>(BOOKS_LIST)

  if (loading && !data) {
    return (
      <section>
        <h1 className="text-3xl mb-6">Catálogo</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h1 className="text-3xl mb-6">Catálogo</h1>
        <div className="text-center py-12">
          <p className="mb-4 text-destructive">No se pudo cargar el catálogo.</p>
          <Button onClick={() => void refetch()}>Reintentar</Button>
        </div>
      </section>
    )
  }

  const books = data?.books ?? []

  if (books.length === 0) {
    return (
      <section>
        <h1 className="text-3xl mb-6">Catálogo</h1>
        <EmptyState
          icon={BookOpen}
          title="Sin libros aún"
          description="No hay libros en el catálogo. Pídele a un administrador que añada algunos."
        />
      </section>
    )
  }

  return (
    <section>
      <h1 className="text-3xl mb-6">Catálogo</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((b) => <BookCard key={b.id} book={b} />)}
      </div>
    </section>
  )
}
