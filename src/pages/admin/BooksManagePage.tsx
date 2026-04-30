import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2, BookOpen, Search } from 'lucide-react'
import { Button, Skeleton, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toaster'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const BOOKS = gql`
  query BooksList {
    books { id title author isbn coverUrl totalCopies availableCopies }
  }
`
const DELETE = gql`mutation DeleteBook($id: ID!) { deleteBook(id: $id) }`

interface Book {
  id: string; title: string; author: string
  isbn?: string | null; coverUrl?: string | null
  totalCopies: number; availableCopies: number
}

function BookCoverThumb({ coverUrl, isbn, title }: { coverUrl?: string | null; isbn?: string | null; title: string }) {
  const [err, setErr] = useState(false)
  const initials = title.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  const src = (coverUrl && !err) ? coverUrl : (isbn && !err) ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null
  if (src) return <img src={src} alt="" onError={() => setErr(true)} className="w-full h-full object-cover" />
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <span className="text-xl font-serif font-semibold text-slate-300">{initials}</span>
      <BookOpen aria-hidden className="w-5 h-5 text-slate-200 mt-1" />
    </div>
  )
}

function AvailDots({ available, total }: { available: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: Math.min(total, 5) }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < available ? 'bg-emerald-500' : 'bg-slate-200'}`} aria-hidden />
      ))}
      {total > 5 && <span className="text-xs text-fg/30 ml-0.5">+{total - 5}</span>}
    </div>
  )
}

export function BooksManagePage() {
  const { data, loading, error, refetch } = useQuery<{ books: Book[] }>(BOOKS)
  const [deleteBook] = useMutation(DELETE)
  const [confirm, setConfirm] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const toast = useToast()

  const books = (data?.books ?? []).filter((b) =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    if (!confirm) return
    setDeleting(true)
    try {
      const res = await deleteBook({ variables: { id: confirm.id } })
      if (res.error) { toast.push('error', mapErrorToMessage(extractErrorCode(res.error))); return }
      toast.push('success', `"${confirm.title}" eliminado`)
      setConfirm(null)
      void refetch()
    } catch (e) {
      toast.push('error', mapErrorToMessage(extractErrorCode(e)))
    } finally { setDeleting(false) }
  }

  return (
    <section>
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold mb-1">Catálogo</h1>
          {!loading && !error && (
            <p className="text-fg/50 text-sm">{data?.books.length ?? 0} libro{data?.books.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <Link to="/admin/books/new">
          <Button className="gap-2">
            <PlusCircle aria-hidden className="w-4 h-4" /> Nuevo libro
          </Button>
        </Link>
      </div>

      {/* search */}
      {!loading && (data?.books.length ?? 0) > 0 && (
        <div className="relative mb-6">
          <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg/30" />
          <input
            type="search"
            placeholder="Filtrar por título o autor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm
              placeholder:text-fg/40 focus:outline focus:outline-2 focus:outline-ring"
          />
        </div>
      )}

      {/* skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <Skeleton className="aspect-[2/3] w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-destructive text-sm">No se pudo cargar el catálogo.</p>}

      {/* empty */}
      {!loading && !error && books.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen aria-hidden className="w-8 h-8 text-fg/30" />
          </div>
          <div>
            <p className="font-serif text-xl font-medium mb-1">
              {search ? 'Sin resultados' : 'Sin libros'}
            </p>
            <p className="text-fg/50 text-sm">
              {search ? `Ningún libro coincide con "${search}".` : 'Añade el primer libro con el botón Nuevo libro.'}
            </p>
          </div>
          {!search && (
            <Link to="/admin/books/new"><Button>Crear primer libro</Button></Link>
          )}
        </div>
      )}

      {/* grid */}
      {books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map((b) => (
            <article key={b.id} className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group">
              {/* cover */}
              <div className="relative aspect-[2/3] overflow-hidden bg-slate-50">
                <BookCoverThumb coverUrl={b.coverUrl} isbn={b.isbn} title={b.title} />
                {/* action overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Link to={`/admin/books/${b.id}/edit`}>
                    <button
                      aria-label={`Editar ${b.title}`}
                      className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow hover:bg-muted transition-colors"
                    >
                      <Pencil aria-hidden className="w-4 h-4 text-fg" />
                    </button>
                  </Link>
                  <button
                    aria-label={`Eliminar ${b.title}`}
                    onClick={() => setConfirm(b)}
                    className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow hover:bg-muted transition-colors"
                  >
                    <Trash2 aria-hidden className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>

              {/* info */}
              <div className="p-3">
                <h3 className="text-sm font-serif font-semibold text-fg leading-tight line-clamp-2 mb-0.5">{b.title}</h3>
                <p className="text-xs text-fg/50 line-clamp-1 mb-2">{b.author}</p>
                <AvailDots available={b.availableCopies} total={b.totalCopies} />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* delete confirm modal */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Eliminar libro"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" loading={deleting} onClick={() => void handleDelete()}>Eliminar</Button>
          </>
        }
      >
        <div className="flex gap-4">
          {confirm && (
            <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <BookCoverThumb coverUrl={confirm.coverUrl} isbn={confirm.isbn} title={confirm.title} />
            </div>
          )}
          <div>
            <p className="font-medium mb-1">¿Eliminar <span className="font-serif">"{confirm?.title}"</span>?</p>
            <p className="text-sm text-fg/60">Esta acción no se puede deshacer.</p>
          </div>
        </div>
      </Modal>
    </section>
  )
}
