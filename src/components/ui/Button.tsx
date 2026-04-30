import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'dark'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-muted text-fg hover:bg-border',
  ghost: 'bg-transparent text-fg hover:bg-muted',
  destructive: 'bg-destructive text-white hover:opacity-90',
  dark: 'bg-fg text-surface hover:bg-fg/90',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', loading, disabled, className = '', children, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded font-medium
        transition-transform duration-120 active:scale-[0.97]
        focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-11
        ${styles[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 aria-hidden className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
