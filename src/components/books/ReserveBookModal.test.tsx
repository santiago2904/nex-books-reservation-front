import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ToasterProvider } from '@/components/ui/Toaster'
import { ReserveBookModal } from './ReserveBookModal'
import type { ReactNode } from 'react'

const { mockMutate } = vi.hoisted(() => ({ mockMutate: vi.fn() }))

vi.mock('@apollo/client/react', () => ({
  ApolloProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useMutation: () => [mockMutate, { loading: false }],
  useQuery: () => ({ data: undefined, loading: false, error: undefined }),
}))

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@apollo/client')>()
  return { ...actual }
})

// Mock DatePicker as a plain date input so tests can interact with it
vi.mock('@/components/ui/DatePicker', () => ({
  DatePicker: ({ value, onChange, id }: { value?: Date; onChange: (d: Date) => void; id?: string }) => (
    <input
      id={id}
      type="date"
      aria-label="Fecha de devolución"
      value={value ? value.toISOString().slice(0, 10) : ''}
      onChange={(e) => e.target.value && onChange(new Date(e.target.value + 'T12:00:00'))}
    />
  ),
}))

const book = { id: 'b1', title: 'Sapiens', author: 'Harari', availableCopies: 2, totalCopies: 3 }

function renderModal(onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <ToasterProvider>
        <ReserveBookModal open onClose={onClose} book={book} />
      </ToasterProvider>
    </MemoryRouter>,
  )
}

describe('ReserveBookModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('sends idempotencyKey with the mutation variables', async () => {
    mockMutate.mockResolvedValue({ data: { createReservation: { id: 'r-1', status: 'ACTIVE' } } })
    renderModal()

    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
    await userEvent.type(screen.getByLabelText(/fecha de devolución/i), tomorrow)
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }))

    expect(mockMutate).toHaveBeenCalledOnce()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { input } = (mockMutate.mock.calls[0]![0] as { variables: { input: Record<string, unknown> } }).variables
    expect(input).toMatchObject({ bookId: 'b1' })
    expect(input.idempotencyKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('shows available copies count', () => {
    mockMutate.mockResolvedValue({ data: null })
    renderModal()
    // AvailDots renders "2 de 3" for available < total
    expect(screen.getByText(/2 de 3/i)).toBeInTheDocument()
  })
})
