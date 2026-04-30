import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui'

interface BookSummary {
  id: string
  title: string
  author: string
  isbn?: string | null
  coverUrl?: string | null
  availableCopies: number
  totalCopies: number
}

function CoverImage({ coverUrl, isbn, title }: { coverUrl?: string | null; isbn?: string | null; title: string }) {
  const [imgError, setImgError] = useState(false)
  // Priority: backend coverUrl → Open Library via isbn → initials
  const src = (coverUrl && !imgError)
    ? coverUrl
    : (isbn && !imgError)
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
      : null

  const initials = title.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

  if (src) {
    return (
      <img
        src={src}
        alt={`Portada de ${title}`}
        onError={() => setImgError(true)}
        loading="lazy"
        width={150}
        height={225}
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-50 to-slate-100">
      <span className="text-3xl font-serif font-semibold text-slate-300 tracking-widest">{initials}</span>
      <BookOpen aria-hidden className="w-6 h-6 text-slate-200" />
    </div>
  )
}

function AvailDots({ available, total }: { available: number; total: number }) {
  const capped = Math.min(total, 5)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: capped }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < available ? 'bg-emerald-500' : 'bg-slate-200'}`}
          aria-hidden
        />
      ))}
      {total > 5 && <span className="text-xs text-fg/30 ml-1">+{total - 5}</span>}
    </div>
  )
}

export function BookCard({ book }: { book: BookSummary }) {
  const unavailable = book.availableCopies === 0

  return (
    <Link
      to={`/books/${book.id}`}
      className="group block focus:outline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded-xl"
    >
      <article
        className={`
          bg-surface rounded-xl border border-border/50 overflow-hidden
          shadow-sm transition-all duration-200
          group-hover:shadow-lg group-hover:-translate-y-0.5
          active:scale-[0.97] active:shadow-sm
          h-full flex flex-col
          ${unavailable ? 'opacity-70' : ''}
        `}
      >
        {/* cover */}
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-50">
          <CoverImage coverUrl={book.coverUrl} isbn={book.isbn} title={book.title} />
          {unavailable && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <span className="text-xs font-medium text-fg/50 bg-white/80 px-2 py-1 rounded">
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* info */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <h3
            className="text-sm font-serif font-semibold text-fg leading-tight line-clamp-2"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="text-xs text-fg/50 line-clamp-1">{book.author}</p>
          <div className="mt-auto pt-1.5">
            <AvailDots available={book.availableCopies} total={book.totalCopies} />
          </div>
        </div>
      </article>
    </Link>
  )
}

export function BookCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border/50 overflow-hidden shadow-sm">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-16 mt-2" />
      </div>
    </div>
  )
}
