import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-day-picker/style.css'

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  min?: Date
  max?: Date
  placeholder?: string
  error?: boolean
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = 'Selecciona una fecha',
  error,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full flex items-center justify-between gap-3
            px-4 py-3 rounded-xl border bg-surface text-sm
            transition-colors duration-150 cursor-pointer
            focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring
            ${error
              ? 'border-destructive text-destructive'
              : value
                ? 'border-border text-fg'
                : 'border-border text-fg/40'
            }
          `}
        >
          <span>
            {value
              ? format(value, "d 'de' MMMM yyyy", { locale: es })
              : placeholder
            }
          </span>
          <CalendarIcon aria-hidden className="w-4 h-4 text-fg/40 shrink-0" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-50 bg-surface rounded-2xl shadow-xl border border-border/50 p-3 outline-none
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(d) => { onChange(d); if (d) setOpen(false) }}
            locale={es}
            disabled={[
              ...(min ? [{ before: min }] : []),
              ...(max ? [{ after: max }] : []),
            ]}
            components={{
              PreviousMonthButton: (props) => (
                <button {...props} aria-label="Mes anterior"
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer focus:outline focus:outline-2 focus:outline-ring">
                  <ChevronLeft aria-hidden className="w-4 h-4 text-fg/60" />
                </button>
              ),
              NextMonthButton: (props) => (
                <button {...props} aria-label="Mes siguiente"
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer focus:outline focus:outline-2 focus:outline-ring">
                  <ChevronRight aria-hidden className="w-4 h-4 text-fg/60" />
                </button>
              ),
            }}
            classNames={{
              months: 'flex flex-col',
              month: 'space-y-3',
              month_caption: 'flex justify-between items-center px-1 mb-1',
              caption_label: 'text-sm font-semibold text-fg capitalize',
              nav: 'flex items-center gap-1',
              month_grid: 'w-full border-collapse',
              weekdays: 'flex mb-1',
              weekday: 'w-9 text-center text-xs text-fg/40 font-medium py-1',
              weeks: 'space-y-0.5',
              week: 'flex',
              day: 'w-9 h-9',
              day_button: `
                w-9 h-9 rounded-lg text-sm transition-colors
                hover:bg-muted focus:outline focus:outline-2 focus:outline-ring
                cursor-pointer font-normal text-fg
              `,
              selected: '[&>button]:bg-fg [&>button]:text-surface [&>button]:hover:bg-fg/90 [&>button]:font-semibold',
              today: '[&>button]:font-bold [&>button]:text-primary',
              outside: '[&>button]:text-fg/25 [&>button]:pointer-events-none',
              disabled: '[&>button]:text-fg/20 [&>button]:pointer-events-none',
              range_start: '',
              range_end: '',
              range_middle: '',
              hidden: 'invisible',
            }}
          />
          <Popover.Arrow className="fill-surface stroke-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
