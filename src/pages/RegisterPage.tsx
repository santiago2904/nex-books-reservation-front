import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Input, Label, Button } from '@/components/ui'
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
    .string().min(8, 'Mínimo 8 caracteres')
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
        setError('root', { message: msg }); toast.push('error', msg); return
      }
      const { accessToken, user } = (res.data as { register: { accessToken: string; user: import('@/auth/AuthContext').AuthUser } }).register
      auth.login(accessToken, user)
      nav('/', { replace: true })
    } catch (e) {
      const msg = mapErrorToMessage(extractErrorCode(e))
      setError('root', { message: msg }); toast.push('error', msg)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* left panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[500px] bg-[#FFFBEB] border-r border-border flex-col justify-between p-12 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-fg flex items-center justify-center">
            <BookOpen aria-hidden className="w-4 h-4 text-surface" />
          </div>
          <span className="font-serif text-xl font-semibold">Nex Books</span>
        </div>
        <div>
          <blockquote className="font-serif text-3xl font-medium text-fg/80 leading-snug mb-4">
            "No hay amigo tan leal como un libro."
          </blockquote>
          <p className="text-sm text-fg/40">— Ernest Hemingway</p>
        </div>
        <p className="text-xs text-fg/30">Gestión de reservas de biblioteca</p>
      </div>

      {/* right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-bg">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-fg flex items-center justify-center">
              <BookOpen aria-hidden className="w-4 h-4 text-surface" />
            </div>
            <span className="font-serif text-xl font-semibold">Nex Books</span>
          </div>

          <h1 className="text-3xl font-serif font-semibold mb-1">Crear cuenta</h1>
          <p className="text-fg/50 text-sm mb-8">Regístrate para acceder a la biblioteca.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name" type="text" autoComplete="name"
                error={!!errors.name} aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-err' : undefined}
                {...register('name')}
              />
              {errors.name && <p id="name-err" className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email" type="email" autoComplete="email"
                error={!!errors.email} aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-err' : undefined}
                {...register('email')}
              />
              {errors.email && <p id="email-err" className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password" type="password" autoComplete="new-password"
                error={!!errors.password} aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'pwd-err' : undefined}
                {...register('password')}
              />
              {errors.password && <p id="pwd-err" className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            {errors.root && <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>}
            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-sm text-fg/50 text-center">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-fg font-medium hover:underline underline-offset-2">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
