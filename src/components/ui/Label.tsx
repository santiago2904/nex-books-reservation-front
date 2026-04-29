import { type LabelHTMLAttributes } from 'react'

export function Label({ className = '', children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block text-sm font-medium mb-1 ${className}`} {...rest}>
      {children}
    </label>
  )
}
