import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, BookOpen, ImageIcon } from 'lucide-react'
import { Button, Input, Label, Skeleton } from '@/components/ui'
import { useToast } from '@/components/ui/Toaster'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const BOOK = gql`query BookById($id: ID!) { book(id: $id) { id title author isbn description coverUrl copies { id code status } } }`
const CREATE = gql`mutation CreateBook($input: CreateBookInput!) { createBook(input: $input) { id title } }`
const UPDATE = gql`mutation UpdateBook($id: ID!, $input: UpdateBookInput!) { updateBook(id: $id, input: $input) { id title } }`
const ADD_COPY = gql`mutation AddBookCopy($bookId: ID!) { addBookCopy(bookId: $bookId) { id code status } }`
const REMOVE_COPY = gql`mutation RemoveBookCopy($copyId: ID!) { removeBookCopy(copyId: $copyId) }`

const schema = z.object({
  title: z.string().min(1, 'Requerido'),
  author: z.string().min(1, 'Requerido'),
  isbn: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  coverUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  initialCopies: z.coerce.number().int().min(1, 'Mínimo 1').optional(),
})
type Form = z.infer<typeof schema>

function CoverPreview({ url, isbn, title }: { url?: string; isbn?: string; title?: string }) {
  const [imgErr, setImgErr] = useState(false)

  useEffect(() => setImgErr(false), [url, isbn])

  const initials = (title ?? '').split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  const src = (url && !imgErr) ? url : (isbn && !imgErr) ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null

  if (src) {
    return (
      <img
        src={src}
        alt="Portada"
        onError={() => setImgErr(true)}
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-50 to-slate-100">
      {title ? (
        <>
          <span className="text-3xl font-serif font-semibold text-slate-300 text-center px-4 line-clamp-3 leading-tight">{initials}</span>
          <BookOpen aria-hidden className="w-8 h-8 text-slate-200" />
        </>
      ) : (
        <>
          <ImageIcon aria-hidden className="w-10 h-10 text-slate-200" />
          <p className="text-xs text-slate-300">Vista previa</p>
        </>
      )}
    </div>
  )
}

function FormField({ id, label, optional, error, children }: {
  id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5">
        {label}{optional && <span className="text-fg/40 font-normal ml-1">(opcional)</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

export function BookFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const nav = useNavigate()
  const toast = useToast()

  const { data, loading: bookLoading } = useQuery<{
    book: { id: string; title: string; author: string; isbn?: string | null; description?: string | null; coverUrl?: string | null; copies: { id: string; code: string; status: string }[] } | null
  }>(BOOK, { variables: { id }, skip: !isEdit })

  const [create] = useMutation(CREATE)
  const [update] = useMutation(UPDATE)
  const [addCopy, { loading: addingCopy }] = useMutation(ADD_COPY)
  const [removeCopy] = useMutation(REMOVE_COPY)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const watchedCoverUrl = watch('coverUrl') as string | undefined
  const watchedIsbn = watch('isbn') as string | undefined
  const watchedTitle = watch('title') as string | undefined

  useEffect(() => {
    if (data?.book) {
      reset({
        title: data.book.title,
        author: data.book.author,
        isbn: data.book.isbn ?? '',
        description: data.book.description ?? '',
        coverUrl: data.book.coverUrl ?? '',
      })
    }
  }, [data, reset])

  const onSubmit = async (form: Form) => {
    try {
      if (isEdit) {
        const res = await update({ variables: { id, input: { title: form.title, author: form.author, isbn: form.isbn || null, description: form.description || null, coverUrl: form.coverUrl || null } } })
        if (res.error) { toast.push('error', mapErrorToMessage(extractErrorCode(res.error))); return }
        toast.push('success', 'Libro actualizado')
      } else {
        const res = await create({ variables: { input: { title: form.title, author: form.author, isbn: form.isbn || null, description: form.description || null, coverUrl: form.coverUrl || null, initialCopies: form.initialCopies ?? 1 } } })
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

  if (isEdit && bookLoading) {
    return (
      <div className="max-w-4xl">
        <Skeleton className="h-4 w-28 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8">
          <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  const copies = data?.book?.copies ?? []

  return (
    <section className="max-w-4xl">
      {/* back */}
      <Link to="/admin/books" className="inline-flex items-center gap-1.5 text-sm text-fg/50 hover:text-fg transition-colors mb-8 focus:outline focus:outline-2 focus:outline-ring rounded">
        <ArrowLeft aria-hidden className="w-4 h-4" />
        Catálogo
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-serif font-semibold">{isEdit ? 'Editar libro' : 'Nuevo libro'}</h1>
      </div>

      {/* two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8 items-start">

        {/* form */}
        <div className="space-y-6">
          <form id="book-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* section: info */}
            <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40">Información</h2>
              <FormField id="title" label="Título" error={errors.title?.message}>
                <Input id="title" error={!!errors.title} placeholder="Título del libro" {...register('title')} />
              </FormField>
              <FormField id="author" label="Autor" error={errors.author?.message}>
                <Input id="author" error={!!errors.author} placeholder="Nombre del autor" {...register('author')} />
              </FormField>
              <FormField id="description" label="Descripción" optional>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Sinopsis del libro…"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-fg text-sm resize-none
                    focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring placeholder:text-fg/40"
                  {...register('description')}
                />
              </FormField>
            </div>

            {/* section: identifiers */}
            <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40">Identificadores</h2>
              <FormField id="isbn" label="ISBN" optional error={errors.isbn?.message}>
                <Input id="isbn" placeholder="978-0-..." {...register('isbn')} />
              </FormField>
              <FormField id="coverUrl" label="URL de portada" optional error={errors.coverUrl?.message}>
                <Input id="coverUrl" type="url" placeholder="https://ejemplo.com/portada.jpg" error={!!errors.coverUrl} {...register('coverUrl')} />
                <p className="text-xs text-fg/40 mt-1">La imagen se previsualiza en tiempo real →</p>
              </FormField>
            </div>

            {/* section: copies (create only) */}
            {!isEdit && (
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40 mb-4">Ejemplares</h2>
                <FormField id="initialCopies" label="Número inicial de ejemplares" error={errors.initialCopies?.message}>
                  <Input id="initialCopies" type="number" min="1" defaultValue={1} error={!!errors.initialCopies} {...register('initialCopies')} />
                </FormField>
              </div>
            )}
          </form>

          <Button form="book-form" type="submit" loading={isSubmitting} className="w-full sm:w-auto">
            {isEdit ? 'Guardar cambios' : 'Crear libro'}
          </Button>

          {/* copies management (edit only) */}
          {isEdit && (
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40">
                  Ejemplares <span className="text-fg/60 font-normal">({copies.length})</span>
                </h2>
                <Button variant="secondary" onClick={() => void handleAddCopy()} loading={addingCopy} className="text-xs py-1.5 px-3 h-auto min-h-0">
                  <Plus aria-hidden className="w-3 h-3" /> Añadir
                </Button>
              </div>
              {copies.length === 0 ? (
                <p className="text-sm text-fg/50">Sin ejemplares. Añade al menos uno.</p>
              ) : (
                <ul className="space-y-2">
                  {copies.map((c) => (
                    <li key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${c.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-400'}`} aria-hidden />
                        <span className="font-mono text-xs text-fg/70">{c.code}</span>
                        <span className={`text-xs ${c.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-amber-600'}`}>{c.status}</span>
                      </div>
                      {c.status === 'AVAILABLE' && (
                        <button
                          aria-label={`Eliminar ejemplar ${c.code}`}
                          onClick={() => void handleRemoveCopy(c.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Trash2 aria-hidden className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* cover preview */}
        <div className="md:sticky md:top-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-fg/40 mb-3">Portada</p>
          <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-lg">
            <CoverPreview url={watchedCoverUrl} isbn={watchedIsbn} title={watchedTitle} />
          </div>
          {watchedTitle && (
            <div className="mt-3 px-1">
              <p className="font-serif font-semibold text-sm text-fg leading-tight line-clamp-2">{watchedTitle}</p>
              {watchedIsbn && <p className="text-xs text-fg/40 mt-0.5 font-mono">{watchedIsbn}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
