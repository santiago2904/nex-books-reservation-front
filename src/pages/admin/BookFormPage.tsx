import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button, Input, Label, Card, Skeleton } from '@/components/ui'
import { useToast } from '@/components/ui/Toaster'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const BOOK = gql`query BookById($id: ID!) { book(id: $id) { id title author isbn description copies { id code status } } }`
const CREATE = gql`mutation CreateBook($input: CreateBookInput!) { createBook(input: $input) { id title } }`
const UPDATE = gql`mutation UpdateBook($id: ID!, $input: UpdateBookInput!) { updateBook(id: $id, input: $input) { id title } }`
const ADD_COPY = gql`mutation AddBookCopy($bookId: ID!) { addBookCopy(bookId: $bookId) { id code status } }`
const REMOVE_COPY = gql`mutation RemoveBookCopy($copyId: ID!) { removeBookCopy(copyId: $copyId) }`

const schema = z.object({
  title: z.string().min(1, 'Requerido'),
  author: z.string().min(1, 'Requerido'),
  isbn: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  initialCopies: z.coerce.number().int().min(1, 'Mínimo 1').optional(),
})
type Form = z.infer<typeof schema>

export function BookFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const nav = useNavigate()
  const toast = useToast()

  const { data, loading: bookLoading } = useQuery<{ book: { id: string; title: string; author: string; isbn?: string | null; description?: string | null; copies: { id: string; code: string; status: string }[] } | null }>(
    BOOK, { variables: { id }, skip: !isEdit }
  )
  const [create] = useMutation(CREATE)
  const [update] = useMutation(UPDATE)
  const [addCopy, { loading: addingCopy }] = useMutation(ADD_COPY)
  const [removeCopy] = useMutation(REMOVE_COPY)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (data?.book) {
      reset({ title: data.book.title, author: data.book.author, isbn: data.book.isbn ?? '', description: data.book.description ?? '' })
    }
  }, [data, reset])

  const onSubmit = async (form: Form) => {
    try {
      if (isEdit) {
        const res = await update({ variables: { id, input: { title: form.title, author: form.author, isbn: form.isbn || null, description: form.description || null } } })
        if (res.error) { toast.push('error', mapErrorToMessage(extractErrorCode(res.error))); return }
        toast.push('success', 'Libro actualizado')
      } else {
        const res = await create({ variables: { input: { title: form.title, author: form.author, isbn: form.isbn || null, description: form.description || null, initialCopies: form.initialCopies ?? 1 } } })
        if (res.error) { toast.push('error', mapErrorToMessage(extractErrorCode(res.error))); return }
        const newId = (res.data as { createBook: { id: string } }).createBook.id
        toast.push('success', 'Libro creado')
        nav(`/admin/books/${newId}/edit`)
      }
    } catch (e) { toast.push('error', mapErrorToMessage(extractErrorCode(e))) }
  }

  const handleAddCopy = async () => {
    if (!id) return
    try {
      const res = await addCopy({ variables: { bookId: id }, refetchQueries: [{ query: BOOK, variables: { id } }] })
      if (res.error) { toast.push('error', mapErrorToMessage(extractErrorCode(res.error))); return }
      toast.push('success', 'Ejemplar añadido')
    } catch (e) { toast.push('error', mapErrorToMessage(extractErrorCode(e))) }
  }

  const handleRemoveCopy = async (copyId: string) => {
    try {
      const res = await removeCopy({ variables: { copyId }, refetchQueries: [{ query: BOOK, variables: { id } }] })
      if (res.error) { toast.push('error', mapErrorToMessage(extractErrorCode(res.error))); return }
      toast.push('success', 'Ejemplar eliminado')
    } catch (e) { toast.push('error', mapErrorToMessage(extractErrorCode(e))) }
  }

  if (isEdit && bookLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>

  return (
    <section className="max-w-xl">
      <Link to="/admin/books" className="inline-flex items-center gap-1 text-sm text-fg/70 hover:text-primary mb-6">
        <ArrowLeft aria-hidden className="w-4 h-4" /> Volver al catálogo
      </Link>
      <h1 className="text-3xl mb-6">{isEdit ? 'Editar libro' : 'Nuevo libro'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {(['title', 'author'] as const).map((field) => (
          <div key={field}>
            <Label htmlFor={field}>{field === 'title' ? 'Título' : 'Autor'}</Label>
            <Input id={field} error={!!errors[field]} {...register(field)} />
            {errors[field] && <p className="text-sm text-destructive mt-1">{errors[field]?.message}</p>}
          </div>
        ))}
        <div>
          <Label htmlFor="isbn">ISBN <span className="text-fg/50">(opcional)</span></Label>
          <Input id="isbn" {...register('isbn')} />
        </div>
        <div>
          <Label htmlFor="description">Descripción <span className="text-fg/50">(opcional)</span></Label>
          <Input id="description" {...register('description')} />
        </div>
        {!isEdit && (
          <div>
            <Label htmlFor="initialCopies">Número de ejemplares iniciales</Label>
            <Input id="initialCopies" type="number" min="1" defaultValue={1} error={!!errors.initialCopies} {...register('initialCopies')} />
            {errors.initialCopies && <p className="text-sm text-destructive mt-1">{errors.initialCopies.message}</p>}
          </div>
        )}
        <Button type="submit" loading={isSubmitting}>{isEdit ? 'Guardar cambios' : 'Crear libro'}</Button>
      </form>

      {isEdit && data?.book && (
        <Card className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Ejemplares ({data.book.copies.length})</h2>
            <Button variant="secondary" onClick={() => void handleAddCopy()} loading={addingCopy}>
              <Plus aria-hidden className="w-4 h-4" /> Añadir
            </Button>
          </div>
          {data.book.copies.length === 0
            ? <p className="text-sm text-fg/60">Sin ejemplares. Añade al menos uno.</p>
            : <ul className="space-y-2">
              {data.book.copies.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.code} <span className={`ml-2 text-xs ${c.status === 'AVAILABLE' ? 'text-accent' : 'text-primary'}`}>{c.status}</span></span>
                  {c.status === 'AVAILABLE' && (
                    <button aria-label={`Eliminar ejemplar ${c.code}`} onClick={() => void handleRemoveCopy(c.id)} className="p-1 rounded hover:bg-muted">
                      <Trash2 aria-hidden className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          }
        </Card>
      )}
    </section>
  )
}
