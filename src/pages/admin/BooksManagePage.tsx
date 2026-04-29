import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2, BookOpen } from 'lucide-react'
import { Button, Skeleton, EmptyState, Modal } from '@/components/ui'
import { AvailabilityBadge } from '@/components/books/AvailabilityBadge'
import { useToast } from '@/components/ui/Toaster'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const BOOKS = gql`
  query BooksList {
    books { id title author totalCopies availableCopies }
  }
`
const DELETE = gql`mutation DeleteBook($id: ID!) { deleteBook(id: $id) }`

interface Book { id: string; title: string; author: string; totalCopies: number; availableCopies: number }

export function BooksManagePage() {
  const { data, loading, error, refetch } = useQuery<{ books: Book[] }>(BOOKS)
  const [deleteBook] = useMutation(DELETE)
  const [confirm, setConfirm] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Catálogo</h1>
        <Link to="/admin/books/new">
          <Button><PlusCircle aria-hidden className="w-4 h-4" /> Nuevo libro</Button>
        </Link>
      </div>

      {loading && !data && (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      )}
      {error && <p className="text-destructive">No se pudo cargar el catálogo.</p>}

      {data?.books.length === 0 && (
        <EmptyState icon={BookOpen} title="Sin libros" description="Añade el primer libro con el botón Nuevo libro." />
      )}

      {(data?.books ?? []).length > 0 && (
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Título</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Autor</th>
                <th className="text-left px-4 py-3 font-medium">Disponibles</th>
                <th className="px-4 py-3 font-medium w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data?.books ?? []).map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-4 py-3">{b.title}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-fg/70">{b.author}</td>
                  <td className="px-4 py-3">
                    <AvailabilityBadge available={b.availableCopies} total={b.totalCopies} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/admin/books/${b.id}/edit`}>
                        <button aria-label={`Editar ${b.title}`} className="p-1 rounded hover:bg-muted">
                          <Pencil aria-hidden className="w-4 h-4 text-fg/60" />
                        </button>
                      </Link>
                      <button
                        aria-label={`Eliminar ${b.title}`}
                        className="p-1 rounded hover:bg-muted"
                        onClick={() => setConfirm(b)}
                      >
                        <Trash2 aria-hidden className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
        <p>¿Seguro que quieres eliminar <strong>"{confirm?.title}"</strong>?</p>
        <p className="text-sm text-fg/70 mt-1">Esta acción no se puede deshacer.</p>
      </Modal>
    </section>
  )
}
