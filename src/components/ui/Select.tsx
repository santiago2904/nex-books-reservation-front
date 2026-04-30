import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  prefix?: string
  id?: string
}

export function Select({ value, onChange, options, placeholder = 'Seleccionar…', prefix, id }: Props) {
  const current = options.find((o) => o.value === value)

  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger
        id={id}
        aria-label={placeholder}
        className="
          inline-flex items-center justify-between gap-2
          px-3 py-2.5 rounded-xl border border-border bg-surface
          text-sm text-fg focus:outline focus:outline-2 focus:outline-ring
          hover:border-fg/30 transition-colors cursor-pointer
          data-[placeholder]:text-fg/40 min-w-[140px]
        "
      >
        <span className="truncate">
          {prefix && <span className="text-fg/40 mr-1">{prefix}</span>}
          <RadixSelect.Value placeholder={placeholder}>
            {current?.label ?? placeholder}
          </RadixSelect.Value>
        </span>
        <RadixSelect.Icon asChild>
          <ChevronDown aria-hidden className="w-4 h-4 text-fg/40 shrink-0" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={8}
          align="end"
          className="
            z-50 min-w-[160px] bg-surface rounded-2xl shadow-xl border border-border/50
            overflow-hidden
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          "
        >
          <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-fg/40">
            <ChevronUp aria-hidden className="w-4 h-4" />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="p-1.5">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="
                  relative flex items-center justify-between gap-2
                  px-3 py-2.5 rounded-xl text-sm text-fg cursor-pointer
                  select-none outline-none
                  hover:bg-muted
                  data-[state=checked]:font-medium data-[state=checked]:text-fg
                  data-[highlighted]:bg-muted
                "
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check aria-hidden className="w-4 h-4 text-primary" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-fg/40">
            <ChevronDown aria-hidden className="w-4 h-4" />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
