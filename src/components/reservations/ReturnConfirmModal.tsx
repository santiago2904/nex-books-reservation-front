import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { Button, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toaster'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const RETURN = gql`
  mutation ReturnBook($id: ID!) {
    returnBook(reservationId: $id) { id status returnedAt }
  }
`

interface Reservation {
  id: string
  bookCopy: { book: { title: string } }
}

export function ReturnConfirmModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  reservation: Reservation | null
  onSuccess: () => void
}) {
  const [run, { loading }] = useMutation(RETURN)
  const toast = useToast()

  if (!reservation) return null

  const handle = async () => {
    try {
      const res = await run({ variables: { id: reservation.id } })
      if (res.error) {
        toast.push('error', mapErrorToMessage(extractErrorCode(res.error)))
        return
      }
      toast.push('success', 'Libro devuelto')
      onSuccess()
      onClose()
    } catch (e) {
      toast.push('error', mapErrorToMessage(extractErrorCode(e)))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar devolución"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={() => void handle()}>
            Confirmar
          </Button>
        </>
      }
    >
      <p>
        ¿Confirmas la devolución de{' '}
        <strong>"{reservation.bookCopy.book.title}"</strong>?
      </p>
    </Modal>
  )
}
