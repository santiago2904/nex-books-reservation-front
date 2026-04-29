import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type Variant = 'success' | 'error' | 'info'
interface Toast { id: string; variant: Variant; message: string }

const ToastCtx = createContext<{ push: (variant: Variant, message: string) => void } | null>(null)

const icons: Record<Variant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}
const colors: Record<Variant, string> = {
  success: 'bg-accent/15 text-accent border-accent/30',
  error: 'bg-destructive/15 text-destructive border-destructive/30',
  info: 'bg-primary/15 text-primary border-primary/30',
}

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (variant: Variant, message: string) => {
      const id = crypto.randomUUID()
      setToasts((t) => [...t, { id, variant, message }])
      setTimeout(() => remove(id), 4000)
    },
    [remove],
  )

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notificaciones"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      >
        {toasts.map((t) => {
          const Icon = icons[t.variant]
          return (
            <div
              key={t.id}
              className={`flex items-start gap-2 px-4 py-3 rounded border ${colors[t.variant]} shadow-sm bg-surface min-w-[260px]`}
            >
              <Icon aria-hidden className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="flex-1 text-sm">{t.message}</p>
              <button
                aria-label="Cerrar"
                onClick={() => remove(t.id)}
                className="p-0.5 rounded hover:bg-muted"
              >
                <X aria-hidden className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside <ToasterProvider>')
  return ctx
}
