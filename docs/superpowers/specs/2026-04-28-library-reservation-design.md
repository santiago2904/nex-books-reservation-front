# Nex Books Reservation — Frontend Design Spec

**Date:** 2026-04-28
**Repo:** `nex-books-reservation-front`
**Status:** Approved (awaiting implementation plan)

This document is the source of truth for the frontend implementation. The companion backend spec lives in `nex-books-reservation-back/docs/superpowers/specs/2026-04-28-library-reservation-design.md`. Read the backend spec for the data contract — this document describes the UI layer that consumes it.

---

## 1. Goal & scope

Single-page React app for the Nex library reservation assessment, consuming the GraphQL API. Two user types:

- **USER**: register/login, browse books, reserve, view & return own reservations.
- **ADMIN**: everything above + CRUD of books, view all reservations with filters, create users.

Deployed to Vercel (auto-deploy on push to `main`, preview per PR), pointing to the backend ALB.

Out of scope (v1, documented in README): SSR/Next.js, refresh tokens (logout is symbolic), Playwright E2E, internationalization, dark mode, dashboards.

## 2. Stack

- **Framework:** React 18 + Vite 5 + TypeScript 5
- **Routing:** React Router 6
- **Styling:** Tailwind CSS 3
- **Data:** Apollo Client 3 (GraphQL only, no REST, no Redux)
- **Forms:** React Hook Form + Zod (`@hookform/resolvers/zod`)
- **Icons:** Lucide React (no emojis used as icons)
- **Codegen:** `graphql-codegen` with `client-preset` → typed hooks per operation
- **Tests:** Vitest + React Testing Library + MSW
- **Hosting:** Vercel

## 3. Design system

### Tokens (CSS variables consumed by Tailwind theme)

```css
:root {
  --color-primary: #2563EB;
  --color-on-primary: #FFFFFF;
  --color-accent: #059669;       /* "Reservar" / confirm */
  --color-destructive: #DC2626;  /* delete / overdue */
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-fg: #0F172A;
  --color-muted: #F1F5FD;
  --color-border: #E4ECFC;
  --color-ring: #2563EB;
}
```

Tailwind `theme.extend.colors` reads from these. **No raw hex values inside components.**

### Typography

- **Headings (`h1`–`h3`, book titles):** Cormorant Garamond, weights 500/700.
- **UI / body / forms / tables:** Inter, system-ui fallback.
- **Numerals in tables:** `font-feature-settings: 'tnum'` (tabular figures).
- **Scale:** 12 / 14 / 16 / 18 / 20 / 24 / 30. Body base 16px, line-height 1.5.

### Visual style: Flat (touch-first)

- No heavy shadows. Surfaces separated by `1px var(--color-border)` or `bg-surface` over `bg-background`.
- Color blocking on status badges:
  - `AVAILABLE` → green bg with white text
  - `RESERVED` / `ACTIVE` → blue
  - `MAINTENANCE` → yellow
  - `RETURNED` → slate (muted)
- Press feedback: `active:scale-[0.97] transition-transform duration-120` on buttons and clickable cards.
- Icons: Lucide, sizes `16/20/24` (tokens `icon-sm/md/lg`), stroke `1.75`. **Cero emojis.**
- `cursor-pointer` on every clickable element.

### Iconography

Lucide. Decorative icons get `aria-hidden="true"`. Icon-only buttons get `aria-label`.

## 4. Layout

### Public pages (`/login`, `/register`, `/`)

Pattern: **Minimal Single Column** — centered content, max-w-md form on auth, max-w-6xl grid for books list. Generous whitespace.

### Authenticated app shell

```
┌─────────────────────────────────────────────────┐
│ Topbar (logo, user menu + logout)               │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │ Outlet (max-w-6xl, responsive gutter)│
│ (240px)  │                                      │
│ - Libros │                                      │
│ - Mis    │                                      │
│   resvas │                                      │
│ ─ admin ─│                                      │
│ - Books  │                                      │
│ - Resvas │                                      │
│ - Users  │                                      │
└──────────┴──────────────────────────────────────┘
```

- **Sidebar collapses to drawer < 1024px.**
- Active nav item: `bg-muted text-primary border-l-2 border-primary`.
- Admin section in sidebar only renders for `role === 'ADMIN'`.

### Responsive breakpoints

`375 / 640 / 768 / 1024 / 1440` (Tailwind defaults `sm/md/lg/xl/2xl` mapped). Mobile-first. No horizontal scroll on any page at 375px.

## 5. Folder structure

```
src/
├── main.tsx
├── App.tsx
├── routes.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── BooksListPage.tsx              # /
│   ├── BookDetailPage.tsx             # /books/:id
│   ├── MyReservationsPage.tsx         # /my-reservations
│   ├── admin/
│   │   ├── BooksManagePage.tsx        # /admin/books
│   │   ├── BookFormPage.tsx           # /admin/books/new, /admin/books/:id/edit
│   │   ├── ReservationsPage.tsx       # /admin/reservations
│   │   └── CreateUserPage.tsx         # /admin/users/new
│   └── NotFoundPage.tsx
├── components/
│   ├── ui/                            # Button, Input, Select, Modal, Toast, Card, Skeleton, EmptyState
│   ├── layout/                        # AppShell, Topbar, Sidebar, NavMenu, ProtectedRoute
│   ├── books/                         # BookCard, BookList, BookForm, AvailabilityBadge, ReserveBookModal
│   ├── reservations/                  # ReservationRow, ReservationFilters, ReturnButton, ReturnConfirmModal
│   └── auth/                          # LoginForm, RegisterForm
├── graphql/
│   ├── client.ts                      # ApolloClient with authLink + errorLink
│   ├── operations/                    # *.graphql files (queries, mutations, fragments)
│   └── generated/                     # codegen output
├── auth/
│   ├── AuthContext.tsx
│   └── useAuth.ts
├── lib/
│   ├── env.ts                         # zod validation of import.meta.env
│   ├── format.ts                      # date helpers (date-fns)
│   ├── errors.ts                      # error-code → user message mapping
│   └── idempotency.ts                 # generates and persists keys per intent
├── hooks/
└── styles/index.css                   # Tailwind base + custom font imports
```

## 6. Routing

```tsx
<Routes>
  <Route path="/login" element={<LoginPage/>} />
  <Route path="/register" element={<RegisterPage/>} />

  <Route element={<AppShell/>}>
    <Route path="/" element={<BooksListPage/>} />
    <Route path="/books/:id" element={<BookDetailPage/>} />

    <Route element={<ProtectedRoute role="USER"/>}>
      <Route path="/my-reservations" element={<MyReservationsPage/>} />
    </Route>

    <Route element={<ProtectedRoute role="ADMIN"/>}>
      <Route path="/admin/books" element={<BooksManagePage/>} />
      <Route path="/admin/books/new" element={<BookFormPage/>} />
      <Route path="/admin/books/:id/edit" element={<BookFormPage/>} />
      <Route path="/admin/reservations" element={<ReservationsPage/>} />
      <Route path="/admin/users/new" element={<CreateUserPage/>} />
    </Route>
  </Route>

  <Route path="*" element={<NotFoundPage/>} />
</Routes>
```

`ProtectedRoute` reads `useAuth()`:
- No session → redirect to `/login?from=<path>`
- Session but role too low → render `<ForbiddenView/>` (403, **not** redirect)
- Session OK → `<Outlet/>`

URL state: filters on `/admin/reservations` and `/my-reservations` reflect to query params (`?from=...&to=...&status=...`) so refresh keeps filters and links are shareable.

## 7. State management

- **Auth state:** `AuthContext` provides `{ user, accessToken, login, logout, isAdmin }`. Token persisted in `localStorage` under key `auth.token`. Hydrated on app boot. `logout()` clears token and calls `client.clearStore()`.
- **Server data:** **Apollo Client only.** No Redux/Zustand for data. Apollo InMemoryCache holds everything.
- **Local UI state:** `useState`/`useReducer` for ephemeral UI (modal open, filter draft).

Apollo Client config (`src/graphql/client.ts`):

```ts
const httpLink = new HttpLink({ uri: env.VITE_API_URL });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth.token');
  return { headers: { ...headers, ...(token && { authorization: `Bearer ${token}` }) } };
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors?.some(e => e.extensions?.code === 'UNAUTHENTICATED')) {
    authStore.logout();
    window.location.href = '/login';
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({ /* type policies for paginations */ }),
});
```

`fetchPolicy: 'cache-and-network'` for list pages (fast UI + fresh data).

## 8. GraphQL operations

All operations live in `src/graphql/operations/` as `.graphql` files. `pnpm codegen` (and `codegen --watch` during dev) generates typed hooks. Cero tipos manuales para ops.

Key operations:

| Operation | File |
|-----------|------|
| `login`, `register`, `me` | `auth.graphql` |
| `books`, `book`, `createBook`, `updateBook`, `deleteBook`, `addBookCopy`, `removeBookCopy` | `books.graphql` |
| `myReservations`, `reservationsByBook`, `reservationsByUser` | `reservations.queries.graphql` |
| `createReservation`, `returnBook` | `reservations.mutations.graphql` |
| `createUser` | `users.graphql` |

## 9. Forms

`react-hook-form` + Zod resolver. The Zod schema is the single source of truth:

```ts
const reserveSchema = z.object({
  dueDate: z.coerce.date()
    .refine(d => d > new Date(), 'La fecha debe ser futura')
    .refine(d => d.getTime() - Date.now() <= 90*24*3600*1000, 'Máximo 90 días'),
});
type ReserveInput = z.infer<typeof reserveSchema>;
```

UX rules (enforced in every form):

- **Visible label above input** (no placeholder-only).
- **Error inline below the field** with `AlertCircle` icon and `--color-destructive`. Message must say what to do, not just "invalid".
- **Validation `mode: 'onBlur'`** (no on-keystroke).
- **Submit:** button shows `Loading` spinner during pending; auto-disabled. On success, toast + navigate. On error, map `extensions.code` to Spanish message.
- **Auto-focus first invalid field** on submit error (a11y).
- **`aria-live="polite"`** on the toast container.

## 10. Critical UX flows

### 10.1 Reserve a book (golden path)

1. `/` shows grid of `BookCard`s with `availableCopies > 0`. Public, no login required to browse.
2. Click → `/books/:id` shows book detail.
3. If not authenticated, button reads "Iniciar sesión para reservar" → `/login?from=/books/:id`.
4. If authenticated, button "Reservar" opens `<ReserveBookModal/>`.
5. Modal asks for `dueDate` (date input, min=tomorrow, max=+90d) and shows availability.
6. On open, generate `idempotencyKey = crypto.randomUUID()`, store in `useState` so it survives re-renders within the same intent. (See `lib/idempotency.ts`.)
7. Submit → `createReservation` mutation with `{ bookId, dueDate, idempotencyKey }`.
8. Success: toast, close modal, navigate `/my-reservations`.
9. Error: map code to message:
   - `MAX_ACTIVE_RESERVATIONS` → "Ya tienes 3 libros reservados. Devuelve uno antes de reservar otro."
   - `NO_COPIES_AVAILABLE` → "Este libro ya no tiene ejemplares disponibles."
   - other → fallback to `extensions.code` literal.

### 10.2 Return a book

From `/my-reservations`, every `ACTIVE` reservation shows a "Devolver" button. Click opens `<ReturnConfirmModal>` ("¿Confirmas la devolución de '<título>'?"). Confirm fires `returnBook(id)`. On success, optimistic UI update (mark RETURNED), then refetch to confirm. Toast.

### 10.3 Filter reservations (admin)

`/admin/reservations`:
- Filters: `from` (date), `to` (date), `status` (ALL/ACTIVE/RETURNED), optional `userId` and `bookId` selectors (autocomplete).
- Debounce 300ms.
- URL params reflect filter state.
- Clear filters button.
- Empty state when filters return zero.
- Mobile (<768px): rows collapse to cards.

### 10.4 Books CRUD (admin)

- `/admin/books` table with paginación cliente.
- Each row: edit / delete actions.
- Delete blocked if backend returns `BOOK_HAS_ACTIVE_RESERVATIONS` → toast: "No se puede eliminar: tiene reservas activas. Espera a que sean devueltas o márcalas como devueltas."
- Form supports `initialCopies` on create. After create, additional copies via `addBookCopy` mutation. UI exposes a "+ Añadir ejemplar" button on the edit page.
- Remove copy: only enabled if copy is `AVAILABLE`. Otherwise tooltip explains why.

### 10.5 Login / Register

Standard email + password forms. Register = always role USER. Admin users only created by another admin via `/admin/users/new`.

After successful login/register, persist token + redirect to `from` if present, else `/`.

## 11. Required states per list

Every list page implements four states deterministically:

| State | UI |
|-------|-----|
| Loading | Skeleton cards (BookList) or skeleton rows (tables). No bare spinner. |
| Empty | SVG illustration + headline + helpful action. ("Aún no tienes reservas. Reservar un libro →") |
| Error | Message + "Reintentar" button. Never raw stack. |
| Filled | Data with explicit default sort order. |

## 12. Accessibility (gate to "done")

- Body text contrast ≥ 4.5:1; secondary ≥ 3:1. (Palette already complies for tested combinations.)
- All interactive elements have visible focus ring: `outline outline-2 outline-offset-2 outline-ring`.
- Tab order matches visual order.
- Touch targets ≥ 44px (`min-h-11 min-w-11`) on icon-only buttons.
- `prefers-reduced-motion` disables press scale and modal transitions (`@media`).
- Modals: focus trap, return focus to opener on close, `Escape` closes.
- Lucide icons: decorative `aria-hidden`; meaningful `aria-label`.
- Forms: label `for`, error `aria-describedby` linked, `role="alert"` on error toasts.

## 13. Performance

- Code splitting per route (`React.lazy + Suspense`). `/admin/*` not downloaded for USER role.
- Apollo `cache-and-network` for list pages.
- Image optimization: declare `width`/`height` on book covers (if added v2). v1 has no images.
- Debounce 300ms on filter inputs.
- No animations > 300ms.

## 14. Error handling & toasts

- Custom Toaster (~40 lines, no extra dep). Bottom-right stack. Auto-dismiss 4s. Variants `success | error | info`. Closeable with X. `aria-live="polite"`.
- Error mapping in `lib/errors.ts`: backend `extensions.code` → Spanish message.

## 15. Environment & config

`.env.example`:
```
VITE_API_URL=http://localhost:4000/graphql
```

`src/lib/env.ts` validates with Zod at boot:
```ts
const env = z.object({ VITE_API_URL: z.string().url() }).parse(import.meta.env);
```

Vercel project env vars:
- `VITE_API_URL=https://api.nex-books.<domain>/graphql` (or ALB DNS)

`vercel.json` adds security headers:
```json
{ "headers": [{
  "source": "/(.*)",
  "headers": [
    { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
  ]
}]}
```

## 16. Testing

`vitest` + `@testing-library/react` + `msw` for GraphQL mocking. Tests live next to the file under test (`Component.test.tsx`).

**Required tests (v1):**

1. `LoginPage`: invalid credentials → mapped error message rendered.
2. `BooksListPage`: renders loading skeleton, then list, then empty state.
3. `ReserveBookModal`: generates `idempotencyKey` and includes it in mutation variables.
4. `ProtectedRoute`: redirects unauth to `/login`; renders 403 for insufficient role.
5. `lib/errors.ts`: code → message mapping covers every backend code.

CI runs `pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build`.

## 17. CI/CD

Vercel auto-deploys on push to `main` (build = `pnpm build`). Preview deploys per PR. No GHA needed for the front, but a lightweight `.github/workflows/ci.yml` runs lint+typecheck+test+build on PRs to catch regressions before merge.

## 18. Pre-delivery checklist

Before merging to `main`:

- [ ] Lighthouse accessibility ≥ 95 on `/`, `/login`, `/my-reservations`.
- [ ] No emojis used as icons.
- [ ] Every list page has loading / empty / error / filled states.
- [ ] Tab order and focus rings verified manually.
- [ ] `prefers-reduced-motion` honored.
- [ ] 375px width has no horizontal scroll.
- [ ] Tested both light mode (v1) at minimum; dark mode is v2.
- [ ] All forms have visible labels (no placeholder-only).
- [ ] Error toasts use `aria-live`.

## 19. Estimated effort

| Phase | Hours |
|-------|-------|
| Bootstrap (Vite, Tailwind, Apollo, codegen, routing) | 2 |
| Auth (context, login, register, ProtectedRoute) | 4 |
| Layout (AppShell, Sidebar, Topbar, NavMenu) | 3 |
| Books list + detail + ReserveBookModal | 5 |
| MyReservations + ReturnConfirmModal | 3 |
| Admin Books CRUD + BookForm + addCopy/removeCopy | 5 |
| Admin Reservations with filters | 3 |
| Admin CreateUser | 1 |
| UI primitives (Button, Input, Modal, Toast, Skeleton, EmptyState) | 4 |
| Tests | 3 |
| Polish (a11y, loading/empty states, errors mapping) | 3 |
| Vercel + env + headers | 1 |
| README + screenshots | 2 |
| **Total** | **~39h** |

## 20. Open items / explicit non-goals

- No Next.js (SPA only).
- No SSR / SSG.
- No i18n (Spanish only).
- No dark mode.
- No real-time subscriptions.
- No image uploads.
- No Playwright E2E (Vitest + RTL only).
- Logout is symbolic (no server-side revocation).

---

## Acceptance criteria

The frontend is "done" when:

1. Anonymous user can browse books at `/`.
2. User can register, login, reserve a book, view their reservations, return a book — all with appropriate feedback.
3. Admin can CRUD books (including managing copies), view all reservations with date filters, create users.
4. All four required states (loading/empty/error/filled) render on every list page.
5. Lighthouse accessibility ≥ 95 on the key pages.
6. App is deployed on Vercel and connects to the deployed AWS backend over HTTPS, end-to-end golden path works in production.
