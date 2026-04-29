import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Button, Input, Label, Card } from '@/components/ui'
import { useAuth } from '@/auth/useAuth'
import { useToast } from '@/components/ui/Toaster'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { id name email role createdAt }
    }
  }
`

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})
type Form = z.infer<typeof schema>

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })
  const [loginMutation] = useMutation(LOGIN)
  const auth = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const toast = useToast()

  const handleError = (e: unknown) => {
    const code = extractErrorCode(e)
    const msg = mapErrorToMessage(code)
    setError('root', { message: msg })
    toast.push('error', msg)
  }

  const onSubmit = async (data: Form) => {
    try {
      const res = await loginMutation({ variables: { input: data } })
      // Apollo v4 may return errors in result instead of throwing
      if (res.error) { handleError(res.error); return }
      const { accessToken, user } = (res.data as { login: { accessToken: string; user: import('@/auth/AuthContext').AuthUser } }).login
      auth.login(accessToken, user)
      const from = params.get('from') ?? '/'
      nav(from, { replace: true })
    } catch (e) {
      handleError(e)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl mb-1">Bienvenido</h1>
        <p className="text-fg/70 mb-6">Inicia sesión para reservar libros.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-err' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-err" className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              error={!!errors.password}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'pwd-err' : undefined}
              {...register('password')}
            />
            {errors.password && (
              <p id="pwd-err" className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>
          {errors.root && (
            <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>
          )}
          <Button type="submit" loading={isSubmitting} className="w-full">Entrar</Button>
        </form>
        <p className="mt-4 text-sm text-fg/70 text-center">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary hover:underline">Regístrate</Link>
        </p>
      </Card>
    </main>
  )
}
