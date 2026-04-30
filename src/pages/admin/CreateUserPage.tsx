import { useForm, useController } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { UserCircle, Shield, User } from 'lucide-react'
import { Button, Input, Label } from '@/components/ui'
import { useToast } from '@/components/ui/Toaster'
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors'

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) { id name email role createdAt }
  }
`

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Debe contener una letra')
    .regex(/[0-9]/, 'Debe contener un número'),
  role: z.enum(['USER', 'ADMIN']),
})

type Form = z.infer<typeof schema>
type Role = 'USER' | 'ADMIN'

const ROLES: { value: Role; label: string; description: string; icon: typeof User }[] = [
  { value: 'USER', label: 'Usuario', description: 'Puede explorar el catálogo y gestionar sus reservas.', icon: User },
  { value: 'ADMIN', label: 'Administrador', description: 'Acceso completo: libros, reservas y usuarios.', icon: Shield },
]

function RolePicker({ control }: { control: ReturnType<typeof useForm<Form>>['control'] }) {
  const { field } = useController({ name: 'role', control })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ROLES.map(({ value, label, description, icon: Icon }) => {
        const active = field.value === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => field.onChange(value)}
            className={`
              text-left p-4 rounded-xl border transition-all duration-150
              focus:outline focus:outline-2 focus:outline-ring cursor-pointer
              ${active
                ? 'bg-fg text-surface border-fg'
                : 'bg-surface text-fg border-border hover:border-fg/30'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon aria-hidden className={`w-4 h-4 ${active ? 'text-surface' : 'text-fg/50'}`} />
              <span className="font-medium text-sm">{label}</span>
            </div>
            <p className={`text-xs leading-relaxed ${active ? 'text-surface/70' : 'text-fg/50'}`}>
              {description}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function AvatarPreview({ name }: { name?: string }) {
  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center
        ${initials ? 'bg-fg text-surface' : 'bg-muted text-fg/30'}
        transition-colors duration-200
      `}>
        {initials
          ? <span className="text-xl font-semibold font-serif">{initials}</span>
          : <UserCircle aria-hidden className="w-8 h-8" />
        }
      </div>
      {initials && (
        <p className="text-xs text-fg/50 text-center line-clamp-1 max-w-[120px]">{name}</p>
      )}
    </div>
  )
}

export function CreateUserPage() {
  const { register, handleSubmit, reset, watch, control, formState: { errors, isSubmitting }, setError } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER' },
  })
  const [createUser] = useMutation(CREATE_USER)
  const toast = useToast()
  const watchedName = watch('name')

  const onSubmit = async (data: Form) => {
    try {
      const res = await createUser({ variables: { input: data } })
      if (res.error) {
        const msg = mapErrorToMessage(extractErrorCode(res.error))
        setError('root', { message: msg })
        toast.push('error', msg)
        return
      }
      toast.push('success', `Usuario ${data.name} creado`)
      reset()
    } catch (e) {
      const msg = mapErrorToMessage(extractErrorCode(e))
      setError('root', { message: msg })
      toast.push('error', msg)
    }
  }

  return (
    <section className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-semibold mb-1">Crear usuario</h1>
        <p className="text-fg/50 text-sm">Añade un nuevo miembro al sistema.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* avatar preview */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-6">
          <AvatarPreview name={watchedName} />
          <div>
            <p className="font-serif font-semibold text-fg text-lg leading-tight">
              {watchedName || <span className="text-fg/30 font-normal">Nombre del usuario</span>}
            </p>
            <p className="text-xs text-fg/40 mt-0.5">Vista previa del perfil</p>
          </div>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* personal info */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40">Información personal</h2>
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" placeholder="Ej. Ana García" error={!!errors.name} {...register('name')} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" autoComplete="off" placeholder="ana@ejemplo.com" error={!!errors.email} {...register('email')} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" error={!!errors.password} {...register('password')} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
          </div>

          {/* role */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-fg/40">Rol</h2>
            <RolePicker control={control} />
          </div>

          {errors.root && (
            <p role="alert" className="text-sm text-destructive p-3 bg-destructive/5 rounded-xl">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full">
            Crear usuario
          </Button>
        </form>
      </div>
    </section>
  )
}
