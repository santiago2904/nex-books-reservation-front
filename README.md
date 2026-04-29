# Nex Books Reservation — Frontend

React 19 + Vite 8 + TypeScript 6 + Tailwind 4 + Apollo Client 4 SPA.
Connects to the Nex Books reservation GraphQL API.

## Quick start

```bash
pnpm install
cp .env.example .env.development   # adjust VITE_API_URL if needed
pnpm dev                           # http://localhost:5173
```

> Requires the backend running. See [nex-books-reservation-back](../nex-books-reservation-back/README.md).

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/graphql` | Backend GraphQL endpoint |

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm typecheck    # TypeScript check
pnpm test         # Run Vitest tests
pnpm codegen      # Generate typed hooks from GraphQL schema (requires backend)
```

## Tests

```bash
pnpm test
```

12 tests across 5 suites: AuthContext, ProtectedRoute, errors mapping,
LoginPage (mocked Apollo v4), ReserveBookModal (idempotency key).

## Deploy

Connected to Vercel. Push to `main` triggers auto-deploy. Preview deploys per PR.

1. Connect repo to Vercel dashboard
2. Add env var `VITE_API_URL` → your backend URL (e.g. `https://api.nex-books.example.com/graphql`)
3. Build command: `pnpm build` · Output directory: `dist`

Security headers and SPA fallback configured in `vercel.json`.

## Architecture

- **Auth:** `AuthContext` + `useAuth` — JWT in localStorage, logout symbolic (v1)
- **Data:** Apollo Client 4 — `useQuery`/`useMutation` from `@apollo/client/react`
- **Forms:** React Hook Form + Zod 4
- **Routing:** React Router 7 — public / USER-protected / ADMIN-protected routes
- **Code splitting:** `React.lazy` — admin bundle deferred, never downloaded by USER role

Full spec: [`docs/superpowers/specs/2026-04-28-library-reservation-design.md`](docs/superpowers/specs/2026-04-28-library-reservation-design.md)

## Seed test accounts (requires backend with seeds)

| Email | Password | Role |
|---|---|---|
| `admin@nex.test` | `Admin123!` | ADMIN |
| `ana@nex.test` | `User1234!` | USER |
| `bruno@nex.test` | `User1234!` | USER |

## v1 explicit trade-offs

- **Logout symbolic** — clears token client-side only; v2: refresh tokens + server-side revocation
- **No Playwright E2E** — Vitest + RTL + mocked Apollo is the test layer; E2E in v2
- **Apollo mocked in tests** — MSW graphql handlers don't intercept Apollo v4 fetch in jsdom; `vi.mock('@apollo/client/react')` used instead
- **codegen deferred** — run `pnpm codegen` with the backend live to generate typed hooks
