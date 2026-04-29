import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { Button, Input, Label, Card } from '@/components/ui'
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

export function CreateUserPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER' as const },
  })
  const [createUser] = useMutation(CREATE_USER)
  const toast = useToast()

  const onSubmit = async (data: z.infer<typeof schema>) => {
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
    <section className="max-w-md">
      <h1 className="text-3xl mb-6">Crear usuario</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" error={!!errors.name} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" autoComplete="off" error={!!errors.email} {...register('email')} />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="new-password" error={!!errors.password} {...register('password')} />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              className="w-full px-3 py-2 rounded border border-border bg-surface text-fg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring"
              {...register('role')}
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          {errors.root && <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full">Crear usuario</Button>
        </form>
      </Card>
    </section>
  )
}
