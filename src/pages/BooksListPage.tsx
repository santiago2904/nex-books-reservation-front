import { useState, useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { Search, BookOpen } from 'lucide-react'
import { BookCard, BookCardSkeleton } from '@/components/books/BookCard'
import { EmptyState, Button } from '@/components/ui'
import { Select } from '@/components/ui/Select'

const BOOKS_LIST = gql`
  query BooksList {
    books { id title author isbn coverUrl totalCopies availableCopies }
  }
`

interface Book {
  id: string
  title: string
  author: string
  isbn?: string | null
  coverUrl?: string | null
  totalCopies: number
  availableCopies: number
}

type SortOption = 'title' | 'author' | 'availability'

const SORT_LABELS: Record<SortOption, string> = {
  title: 'Título',
  author: 'Autor',
  availability: 'Disponibilidad',
}

export function BooksListPage() {
  const { loading, error, data, refetch } = useQuery<{ books: Book[] }>(BOOKS_LIST)
  const [search, setSearch] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sort, setSort] = useState<SortOption>('title')

  const allBooks = data?.books ?? []

  const filtered = useMemo(() => {
    let result = allBooks

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    }

    if (onlyAvailable) {
      result = result.filter((b) => b.availableCopies > 0)
    }

    return [...result].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'author') return a.author.localeCompare(b.author)
      if (sort === 'availability') return b.availableCopies - a.availableCopies
      return 0
    })
  }, [allBooks, search, onlyAvailable, sort])

  const hasFilters = search || onlyAvailable || sort !== 'title'
  const clearFilters = () => { setSearch(''); setOnlyAvailable(false); setSort('title') }

  return (
    <section>
      {/* header */}
      <div className="mb-6">
        <h1 className="text-4xl font-serif mb-1">Catálogo</h1>
        {!loading && !error && (
          <p className="text-fg/50 text-sm">
            {filtered.length === allBooks.length
              ? `${allBooks.length} título${allBooks.length !== 1 ? 's' : ''}`
              : `${filtered.length} de ${allBooks.length} títulos`
            }
          </p>
        )}
      </div>

      {/* filters bar */}
      {!loading && !error && allBooks.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* search */}
          <div className="relative flex-1 min-w-0 w-full sm:w-auto">
            <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg/30 pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar por título o autor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar libros"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm
                placeholder:text-fg/40 focus:outline focus:outline-2 focus:outline-ring"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center shrink-0">
            {/* availability toggle */}
            <button
              type="button"
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium
                border transition-colors cursor-pointer focus:outline focus:outline-2 focus:outline-ring
                ${onlyAvailable
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-surface border-border text-fg/60 hover:text-fg hover:border-fg/30'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-hidden />
              Solo disponibles
            </button>

            {/* sort */}
            <Select
              value={sort}
              onChange={(v) => setSort(v as SortOption)}
              prefix="Ordenar:"
              options={(Object.keys(SORT_LABELS) as SortOption[]).map((k) => ({ value: k, label: SORT_LABELS[k] }))}
            />

            {/* clear */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-fg/40 hover:text-fg transition-colors focus:outline focus:outline-2 focus:outline-ring rounded px-2 py-1"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}

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

      {/* empty — no books at all */}
      {!loading && !error && allBooks.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Sin libros aún"
          description="No hay libros en el catálogo. Pídele a un administrador que añada algunos."
        />
      )}

      {/* empty — filters have no results */}
      {!loading && !error && allBooks.length > 0 && filtered.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Search aria-hidden className="w-7 h-7 text-fg/30" />
          </div>
          <p className="font-serif text-lg font-medium text-fg">Sin resultados</p>
          <p className="text-fg/50 text-sm">
            {search
              ? `Ningún libro coincide con "${search}".`
              : 'Ningún libro disponible con estos filtros.'
            }
          </p>
          <button type="button" onClick={clearFilters} className="text-sm text-primary hover:underline">
            Ver todos los libros
          </button>
        </div>
      )}

      {/* grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </section>
  )
}
