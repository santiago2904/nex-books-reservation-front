import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { ToasterProvider } from '@/components/ui/Toaster'
import { LoginPage } from './LoginPage'
import type { ReactNode } from 'react'

// vi.hoisted ensures mockMutate is defined before vi.mock factory runs
const { mockMutate } = vi.hoisted(() => ({
  mockMutate: vi.fn(),
}))

vi.mock('@apollo/client/react', () => ({
  ApolloProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useMutation: () => [mockMutate, { loading: false }],
  useQuery: () => ({ data: undefined, loading: false, error: undefined }),
}))

// gql is a no-op template literal tag in tests
vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@apollo/client')>()
  return { ...actual }
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToasterProvider>
          <LoginPage />
        </ToasterProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows mapped error message on invalid credentials', async () => {
    // Apollo v4: MutateResult.error is a CombinedGraphQLErrors-like object with .errors[]
    mockMutate.mockResolvedValue({
      data: null,
      error: { errors: [{ message: 'Invalid', extensions: { code: 'INVALID_CREDENTIALS' } }] },
    })
    renderLogin()
    await userEvent.type(screen.getByLabelText(/correo/i), 'ana@example.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Pass1234!')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/credenciales/i)
  })

  it('renders form with email, password and submit button', () => {
    mockMutate.mockResolvedValue({ data: null })
    renderLogin()
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })
})
