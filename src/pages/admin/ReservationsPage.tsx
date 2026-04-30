import { useState, useEffect, useRef } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebounced(value), delay)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [value, delay])
  return debounced
}
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Calendar, Clock, CheckCircle2, BookOpen, UserCircle } from 'lucide-react'
import { Skeleton, Button } from '@/components/ui'
import { DatePicker } from '@/components/ui/DatePicker'

const ALL_RESERVATIONS = gql`
  query AllReservations($filters: ReservationFiltersInput) {
    allReservations(filters: $filters) {
      id status reservedAt dueDate returnedAt
      bookCopy { id code book { id title author isbn coverUrl } }
      user { id name email }
    }
  }
`

type ResStatus = 'ALL' | 'ACTIVE' | 'RETURNED'

interface Reservation {
  id: string; status: string; reservedAt: string; dueDate: string; returnedAt: string | null
  bookCopy: { id: string; code: string; book: { id: string; title: string; author: string; isbn?: string | null; coverUrl?: string | null } }
  user: { id: string; name: string; email: string }
}

function MiniCover({ coverUrl, isbn, title }: { coverUrl?: string | null; isbn?: string | null; title: string }) {
  const [err, setErr] = useState(false)
  const initials = title.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  const src = (coverUrl && !err) ? coverUrl : (isbn && !err) ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null
  if (src) return <img src={src} alt="" onError={() => setErr(true)} className="w-full h-full object-cover" />
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <span className="text-sm font-serif font-semibold text-slate-300">{initials}</span>
    </div>
  )
}

function AdminReservationRow({ r }: { r: Reservation }) {
  const isActive = r.status === 'ACTIVE'
  const dueDate = new Date(r.dueDate)
  const isOverdue = isActive && dueDate < new Date()

  return (
    <article className={`bg-surface rounded-xl border overflow-hidden shadow-sm transition-all hover:shadow-md ${!isActive ? 'opacity-60 border-border/40' : 'border-border'}`}>
      <div className="flex gap-0">
        {/* cover */}
        <div className="w-14 shrink-0 bg-slate-100 overflow-hidden">
          <div className="h-full min-h-[100px]">
            <MiniCover coverUrl={r.bookCopy.book.coverUrl} isbn={r.bookCopy.book.isbn} title={r.bookCopy.book.title} />
          </div>
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-fg text-sm leading-tight line-clamp-1">{r.bookCopy.book.title}</h3>
              <p className="text-xs text-fg/50">{r.bookCopy.book.author}</p>
            </div>
            <span className={`
              inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0
              ${isActive ? isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 text-emerald-700' : 'bg-muted text-fg/40'}
            `}>
              {isActive
                ? isOverdue ? <><Clock aria-hidden className="w-3 h-3" />Vencida</> : <><CheckCircle2 aria-hidden className="w-3 h-3" />Activa</>
                : <><CheckCircle2 aria-hidden className="w-3 h-3" />Devuelta</>
              }
            </span>
          </div>

          {/* user */}
          <div className="flex items-center gap-1.5 text-xs text-fg/50">
            <UserCircle aria-hidden className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-fg/70">{r.user.name}</span>
            <span className="text-fg/30">·</span>
            <span className="truncate">{r.user.email}</span>
          </div>

          {/* dates */}
          <div className="flex flex-wrap gap-x-3 text-xs text-fg/40">
            <span className="flex items-center gap-1">
              <Calendar aria-hidden className="w-3 h-3" />
              {format(new Date(r.reservedAt), 'dd MMM yyyy', { locale: es })}
            </span>
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : ''}`}>
              <Clock aria-hidden className="w-3 h-3" />
              Vence {format(dueDate, 'dd MMM yyyy', { locale: es })}
            </span>
            {r.returnedAt && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 aria-hidden className="w-3 h-3" />
                {format(new Date(r.returnedAt), 'dd MMM yyyy', { locale: es })}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

const STATUS_TABS: { label: string; value: ResStatus }[] = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Activas', value: 'ACTIVE' },
  { label: 'Devueltas', value: 'RETURNED' },
]

function RowSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden flex gap-0">
      <Skeleton className="w-14 min-h-[100px] rounded-none" />
      <div className="flex-1 px-4 py-3 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function ReservationsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ResStatus>('ALL')
  const [from, setFrom] = useState<Date | undefined>()
  const [to, setTo] = useState<Date | undefined>()
  const debouncedSearch = useDebounce(search, 1000)

  const filters = {
    ...(status !== 'ALL' ? { status } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  }

  const { data, previousData, loading, error, refetch } = useQuery<{ allReservations: Reservation[] }>(
    ALL_RESERVATIONS, { variables: { filters }, notifyOnNetworkStatusChange: false }
  )

  // Keep showing previous results while new search loads — avoids skeleton flash on every keystroke
  const reservations = (data ?? previousData)?.allReservations ?? []
  const isFirstLoad = loading && !previousData && !data
  const isRefetching = loading && (!!previousData || !!data)
  const active = reservations.filter((r) => r.status === 'ACTIVE').length
  const returned = reservations.filter((r) => r.status !== 'ACTIVE').length

  return (
    <section>
      {/* header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-serif font-semibold">Reservas</h1>
          {isRefetching && (
            <div className="w-4 h-4 rounded-full border-2 border-fg/20 border-t-fg/60 animate-spin" aria-label="Cargando" />
          )}
        </div>
        {!isFirstLoad && !error && (
          <p className="text-fg/50 text-sm">
            {reservations.length} resultado{reservations.length !== 1 ? 's' : ''}
            {status === 'ALL' && reservations.length > 0 && ` · ${active} activa${active !== 1 ? 's' : ''} · ${returned} devuelta${returned !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {/* filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 mb-6 space-y-4">
        {/* search */}
        <div className="relative">
          <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg/30" />
          <input
            type="search"
            placeholder="Buscar por libro, autor o usuario…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-fg
              placeholder:text-fg/40 focus:outline focus:outline-2 focus:outline-ring"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* status tabs */}
          <div>
            <p className="text-xs text-fg/40 mb-1.5 font-medium uppercase tracking-wide">Estado</p>
            <div className="flex rounded-xl border border-border overflow-hidden">
              {STATUS_TABS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`
                    px-4 py-2 text-sm font-medium transition-colors cursor-pointer
                    ${status === value ? 'bg-fg text-surface' : 'bg-surface text-fg/60 hover:text-fg hover:bg-muted'}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* date range */}
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="min-w-[180px] flex-1">
              <p className="text-xs text-fg/40 mb-1.5 font-medium uppercase tracking-wide">Desde</p>
              <DatePicker value={from} onChange={setFrom} max={to} placeholder="Fecha inicio" />
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="text-xs text-fg/40 mb-1.5 font-medium uppercase tracking-wide">Hasta</p>
              <DatePicker value={to} onChange={setTo} min={from} placeholder="Fecha fin" />
            </div>
          </div>

          {/* clear */}
          {(search || status !== 'ALL' || from || to) && (
            <Button
              variant="ghost"
              className="text-sm text-fg/50 self-end"
              onClick={() => { setSearch(''); setStatus('ALL'); setFrom(undefined); setTo(undefined) }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* results */}
      {/* Only show skeleton on first load, not on every search refetch */}
      {isFirstLoad && (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}</div>
      )}

      {error && (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-destructive text-sm mb-3">No se pudieron cargar las reservas.</p>
          <Button variant="secondary" onClick={() => void refetch()}>Reintentar</Button>
        </div>
      )}

      {!isFirstLoad && !error && reservations.length === 0 && !isRefetching && (
        <div className="bg-surface rounded-xl border border-border p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen aria-hidden className="w-7 h-7 text-fg/30" />
          </div>
          <p className="font-serif text-lg font-medium text-fg">Sin resultados</p>
          <p className="text-fg/50 text-sm">
            {search ? `No hay reservas que coincidan con "${search}".` : 'No hay reservas con los filtros seleccionados.'}
          </p>
        </div>
      )}

      {reservations.length > 0 && (
        <div className={`space-y-3 transition-opacity duration-150 ${isRefetching ? 'opacity-60' : 'opacity-100'}`}>
          {reservations.map((r) => <AdminReservationRow key={r.id} r={r} />)}
        </div>
      )}
    </section>
  )
}
