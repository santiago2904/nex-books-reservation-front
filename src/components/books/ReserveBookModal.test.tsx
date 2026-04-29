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
    await userEvent.type(screen.getByLabelText(/devolución/i), tomorrow)
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }))

    expect(mockMutate).toHaveBeenCalledOnce()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { input } = (mockMutate.mock.calls[0]![0] as { variables: { input: Record<string, unknown> } }).variables
    expect(input).toMatchObject({ bookId: 'b1' })
    expect(input.idempotencyKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('shows available copies via AvailabilityBadge', () => {
    mockMutate.mockResolvedValue({ data: null })
    renderModal()
    expect(screen.getByText(/2 de 3 disponibles/i)).toBeInTheDocument()
  })
})
