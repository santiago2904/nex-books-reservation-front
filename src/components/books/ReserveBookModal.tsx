import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { Modal, Button, Input, Label } from '@/components/ui'
import { useToast } from '@/components/ui/Toaster'
import { newIdempotencyKey } from '@/lib/idempotency'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'
import { AvailabilityBadge } from './AvailabilityBadge'

const CREATE = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) { id status }
  }
`

const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
const max90 = () => {
  const d = new Date()
  d.setDate(d.getDate() + 90)
  return d.toISOString().slice(0, 10)
}

const schema = z.object({
  dueDate: z.string().refine((v) => new Date(v) > new Date(), 'Debe ser futura'),
})
type Form = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  book: { id: string; title: string; author: string; availableCopies: number; totalCopies: number }
}

export function ReserveBookModal({ open, onClose, book }: Props) {
  const idem = useMemo(newIdempotencyKey, [open])
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })
  const [create] = useMutation(CREATE)
  const toast = useToast()
  const nav = useNavigate()
  const [submitErr, setSubmitErr] = useState<string | null>(null)

  const onSubmit = async (data: Form) => {
    setSubmitErr(null)
    try {
      const res = await create({
        variables: {
          input: {
            bookId: book.id,
            dueDate: new Date(data.dueDate).toISOString(),
            idempotencyKey: idem,
          },
        },
      })
      if (res.error) {
        const msg = mapErrorToMessage(extractErrorCode(res.error))
        setSubmitErr(msg)
        toast.push('error', msg)
        return
      }
      toast.push('success', 'Reserva creada')
      onClose()
      nav('/my-reservations')
    } catch (e) {
      const msg = mapErrorToMessage(extractErrorCode(e))
      setSubmitErr(msg)
      toast.push('error', msg)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Reservar "${book.title}"`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button form="reserve-form" type="submit" loading={isSubmitting}>Confirmar reserva</Button>
        </>
      }
    >
      <p className="text-sm text-fg/70 mb-3">{book.author}</p>
      <div className="mb-4">
        <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} />
      </div>
      <form id="reserve-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Label htmlFor="dueDate">Fecha de devolución</Label>
        <Input
          id="dueDate"
          data-autofocus
          type="date"
          min={tomorrow()}
          max={max90()}
          error={!!errors.dueDate}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? 'due-err' : 'due-help'}
          {...register('dueDate')}
        />
        {errors.dueDate
          ? <p id="due-err" className="text-sm text-destructive mt-1">{errors.dueDate.message}</p>
          : <p id="due-help" className="text-sm text-fg/60 mt-1">Hasta 90 días desde hoy.</p>
        }
        {submitErr && <p role="alert" className="text-sm text-destructive mt-2">{submitErr}</p>}
      </form>
    </Modal>
  )
}
