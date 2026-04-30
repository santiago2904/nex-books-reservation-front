import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useController } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { BookOpen } from 'lucide-react'
import { Modal, Button, Label } from '@/components/ui'
import { DatePicker } from '@/components/ui/DatePicker'
import { useToast } from '@/components/ui/Toaster'
import { newIdempotencyKey } from '@/lib/idempotency'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const CREATE = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) { id status }
  }
`

const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d }
const max90 = () => { const d = new Date(); d.setDate(d.getDate() + 90); return d }

const schema = z.object({
  dueDate: z.date({ error: 'Selecciona una fecha de devolución' })
    .refine((d) => d > new Date(), 'La fecha debe ser posterior a hoy'),
})
type Form = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  book: {
    id: string
    title: string
    author: string
    isbn?: string | null
    coverUrl?: string | null
    availableCopies: number
    totalCopies: number
  }
}

function MiniCover({ coverUrl, isbn, title }: { coverUrl?: string | null; isbn?: string | null; title: string }) {
  const [err, setErr] = useState(false)
  const initials = title.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  const src = (coverUrl && !err) ? coverUrl : (isbn && !err) ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null
  if (src) return <img src={src} alt="" onError={() => setErr(true)} loading="lazy" className="w-full h-full object-cover" />
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <span className="text-xl font-serif font-semibold text-slate-300">{initials}</span>
      <BookOpen aria-hidden className="w-5 h-5 text-slate-200 mt-1" />
    </div>
  )
}

function AvailDots({ available, total }: { available: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: Math.min(total, 5) }).map((_, i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i < available ? 'bg-emerald-500' : 'bg-slate-200'}`} aria-hidden />
      ))}
      <span className="ml-1 text-xs text-fg/50">
        {available === 0 ? 'Sin stock' : available === total ? `${total} disponibles` : `${available} de ${total}`}
      </span>
    </div>
  )
}

export function ReserveBookModal({ open, onClose, book }: Props) {
  const idem = useMemo(newIdempotencyKey, [open])
  const { handleSubmit, control, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })
  const { field } = useController({ name: 'dueDate', control })
  const [create] = useMutation(CREATE)
  const toast = useToast()
  const nav = useNavigate()
  const [submitErr, setSubmitErr] = useState<string | null>(null)

  const onSubmit = async (data: Form) => {
    setSubmitErr(null)
    try {
      const res = await create({
        variables: { input: { bookId: book.id, dueDate: data.dueDate.toISOString(), idempotencyKey: idem } },
      })
      if (res.error) {
        const msg = mapErrorToMessage(extractErrorCode(res.error))
        setSubmitErr(msg); toast.push('error', msg); return
      }
      toast.push('success', 'Reserva creada')
      onClose()
      nav('/my-reservations')
    } catch (e) {
      const msg = mapErrorToMessage(extractErrorCode(e))
      setSubmitErr(msg); toast.push('error', msg)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reservar libro"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button form="reserve-form" type="submit" loading={isSubmitting}>Confirmar reserva</Button>
        </>
      }
    >
      {/* book preview */}
      <div className="flex gap-4 mb-6 p-4 bg-muted/40 rounded-xl">
        <div className="w-14 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-sm">
          <MiniCover coverUrl={book.coverUrl} isbn={book.isbn} title={book.title} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif font-semibold text-fg leading-tight mb-0.5 line-clamp-2">{book.title}</p>
          <p className="text-xs text-fg/50 mb-3">{book.author}</p>
          <AvailDots available={book.availableCopies} total={book.totalCopies} />
        </div>
      </div>

      {/* date picker */}
      <form id="reserve-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Label htmlFor="dueDate-trigger" className="text-sm font-medium text-fg/70 mb-2 block">
          Fecha de devolución
        </Label>
        <DatePicker
          id="dueDate-trigger"
          value={field.value instanceof Date ? field.value : undefined}
          onChange={field.onChange}
          min={tomorrow()}
          max={max90()}
          placeholder="Selecciona una fecha"
          error={!!errors.dueDate}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? 'due-err' : 'due-help'}
        />
        {errors.dueDate
          ? <p id="due-err" className="text-xs text-destructive mt-1.5">{errors.dueDate.message}</p>
          : <p id="due-help" className="text-xs text-fg/40 mt-1.5">Hasta 90 días desde hoy</p>
        }
        {submitErr && (
          <p role="alert" className="text-sm text-destructive mt-3 p-3 bg-destructive/5 rounded-lg">
            {submitErr}
          </p>
        )}
      </form>
    </Modal>
  )
}
