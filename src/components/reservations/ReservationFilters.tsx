import { useSearchParams } from 'react-router-dom'
import { Input, Label } from '@/components/ui'

export function ReservationFilters() {
  const [params, setParams] = useSearchParams()

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted rounded-lg">
      <div>
        <Label htmlFor="f-bookId">ID de libro</Label>
        <Input
          id="f-bookId"
          className="w-48 text-sm"
          placeholder="UUID del libro"
          defaultValue={params.get('bookId') ?? ''}
          onBlur={(e) => set('bookId', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="f-userId">ID de usuario</Label>
        <Input
          id="f-userId"
          className="w-48 text-sm"
          placeholder="UUID del usuario"
          defaultValue={params.get('userId') ?? ''}
          onBlur={(e) => set('userId', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="f-from">Desde</Label>
        <Input
          id="f-from"
          type="date"
          className="text-sm"
          defaultValue={params.get('from') ?? ''}
          onChange={(e) => set('from', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="f-to">Hasta</Label>
        <Input
          id="f-to"
          type="date"
          className="text-sm"
          defaultValue={params.get('to') ?? ''}
          onChange={(e) => set('to', e.target.value)}
        />
      </div>
    </div>
  )
}
