import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Hash, BookMarked } from 'lucide-react'
import { ReserveBookModal } from '@/components/books/ReserveBookModal'
import { Skeleton } from '@/components/ui'
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

function getInitials(title: string) {
  return title.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

function BookCover({ isbn, title }: { isbn?: string | null; title: string }) {
  const [imgError, setImgError] = useState(false)
  const coverUrl = isbn && !imgError
    ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
    : null

  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={`Portada de ${title}`}
        onError={() => setImgError(true)}
        loading="lazy"
        width={200}
        height={300}
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-100 to-slate-200">
      <span className="text-4xl font-serif font-semibold text-slate-400 tracking-widest">{getInitials(title)}</span>
      <BookOpen aria-hidden className="w-8 h-8 text-slate-300" />
    </div>
  )
}

function AvailDots({ available, total }: { available: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${i < available ? 'bg-emerald-500' : 'bg-slate-200'}`}
          aria-hidden
        />
      ))}
      <span className="ml-2 text-sm text-fg/70">
        {available === 0
          ? 'Sin ejemplares disponibles'
          : available === total
            ? `${total} disponibles`
            : `${available} de ${total} disponibles`}
      </span>
    </div>
  )
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const [reserveOpen, setReserveOpen] = useState(false)
  const { loading, error, data } = useQuery<{ book: BookDetail | null }>(BOOK_BY_ID, {
    variables: { id },
    skip: !id,
  })

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-4 w-28 mb-8" />
        <div className="bg-surface rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
            <Skeleton className="h-80 sm:h-full w-full" />
            <div className="p-8 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/3 mt-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data?.book) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <BookMarked aria-hidden className="w-12 h-12 text-fg/20 mx-auto mb-4" />
        <p className="text-fg/60 mb-4">No se pudo cargar el libro.</p>
        <Link to="/" className="text-primary hover:underline text-sm">← Volver al catálogo</Link>
      </div>
    )
  }

  const book = data.book
  const canReserve = book.availableCopies > 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-fg/50 hover:text-fg transition-colors mb-8 focus:outline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded"
      >
        <ArrowLeft aria-hidden className="w-4 h-4" />
        Catálogo
      </Link>

      {/* main card */}
      <div className="bg-surface rounded-2xl shadow-xl overflow-hidden border border-border/50">
        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">

          {/* cover */}
          <div className="relative aspect-[2/3] sm:aspect-auto sm:min-h-[320px] bg-slate-100 overflow-hidden">
            <BookCover isbn={book.isbn} title={book.title} />
            {/* warm overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent sm:hidden" />
          </div>

          {/* info */}
          <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              {/* title + author */}
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-fg leading-tight mb-2">
                {book.title}
              </h1>
              <p className="text-fg/60 text-base mb-6">{book.author}</p>

              {/* divider */}
              <hr className="border-border mb-5" />

              {/* metadata rows */}
              <dl className="space-y-3 text-sm">
                {book.isbn && (
                  <div className="flex items-center gap-3">
                    <Hash aria-hidden className="w-4 h-4 text-fg/30 shrink-0" />
                    <dt className="text-fg/40 w-12 shrink-0">ISBN</dt>
                    <dd className="text-fg/70 font-mono text-xs">{book.isbn}</dd>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <BookOpen aria-hidden className="w-4 h-4 text-fg/30 shrink-0 mt-0.5" />
                  <dt className="text-fg/40 w-12 shrink-0">Stock</dt>
                  <dd>
                    <AvailDots available={book.availableCopies} total={book.totalCopies} />
                  </dd>
                </div>
              </dl>
            </div>

            {/* CTA */}
            <div>
              {isAuthenticated ? (
                <button
                  onClick={() => canReserve && setReserveOpen(true)}
                  disabled={!canReserve}
                  className={`
                    w-full sm:w-auto inline-flex items-center justify-center gap-2
                    px-8 py-3 rounded-lg font-medium text-sm
                    transition-all duration-150 active:scale-[0.97]
                    focus:outline focus:outline-2 focus:outline-ring focus:outline-offset-2
                    ${canReserve
                      ? 'bg-fg text-surface hover:bg-fg/90 cursor-pointer shadow-sm'
                      : 'bg-muted text-fg/30 cursor-not-allowed'
                    }
                  `}
                >
                  {canReserve ? 'Reservar libro' : 'Sin ejemplares disponibles'}
                </button>
              ) : (
                <Link
                  to={`/login?from=/books/${book.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium text-sm bg-fg text-surface hover:bg-fg/90 transition-all duration-150 active:scale-[0.97] focus:outline focus:outline-2 focus:outline-ring focus:outline-offset-2 shadow-sm"
                >
                  Iniciar sesión para reservar
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* description */}
        {book.description && (
          <div className="px-6 sm:px-8 py-5 border-t border-border bg-muted/30">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40 mb-3">Sinopsis</h2>
            <p className="text-fg/70 text-sm leading-relaxed">{book.description}</p>
          </div>
        )}
      </div>

      <ReserveBookModal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        book={book}
      />
    </div>
  )
}
