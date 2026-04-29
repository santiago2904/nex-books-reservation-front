import { forwardRef, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ error, className = '', ...rest }, ref) => (
    <input
      ref={ref}
      className={`w-full px-3 py-2 rounded border bg-surface text-fg
        focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring
        disabled:opacity-50 min-h-11
        ${error ? 'border-destructive' : 'border-border'} ${className}`}
      {...rest}
    />
  ),
)
Input.displayName = 'Input'
