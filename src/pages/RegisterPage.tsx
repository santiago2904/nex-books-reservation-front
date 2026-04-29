import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input, Label, Card } from '@/components/ui'
import { useAuth } from '@/auth/useAuth'
import { useToast } from '@/components/ui/Toaster'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user { id name email role createdAt }
    }
  }
`

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Debe contener una letra')
    .regex(/[0-9]/, 'Debe contener un número'),
})
type Form = z.infer<typeof schema>

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })
  const [registerMutation] = useMutation(REGISTER)
  const auth = useAuth()
  const nav = useNavigate()
  const toast = useToast()

  const onSubmit = async (data: Form) => {
    try {
      const res = await registerMutation({ variables: { input: data } })
      if (res.error) {
        const msg = mapErrorToMessage(extractErrorCode(res.error))
        setError('root', { message: msg })
        toast.push('error', msg)
        return
      }
      const { accessToken, user } = (res.data as { register: { accessToken: string; user: import('@/auth/AuthContext').AuthUser } }).register
      auth.login(accessToken, user)
      nav('/', { replace: true })
    } catch (e) {
      const code = extractErrorCode(e)
      const msg = mapErrorToMessage(code)
      setError('root', { message: msg })
      toast.push('error', msg)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl mb-1">Crear cuenta</h1>
        <p className="text-fg/70 mb-6">Regístrate para acceder a la biblioteca.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              error={!!errors.name}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-err' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p id="name-err" className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
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
              autoComplete="new-password"
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
          <Button type="submit" loading={isSubmitting} className="w-full">Registrarse</Button>
        </form>
        <p className="mt-4 text-sm text-fg/70 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline">Iniciar sesión</Link>
        </p>
      </Card>
    </main>
  )
}
