# Nex Books Reservation Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the React + Vite + Tailwind + Apollo SPA defined in `docs/superpowers/specs/2026-04-28-library-reservation-design.md`, deployed on Vercel and consuming the deployed backend.

**Architecture:** SPA with React Router. Apollo Client owns server data; AuthContext owns auth. Pages compose UI primitives. Forms use RHF + Zod. GraphQL operations are codegen'd into typed hooks. Tests with Vitest + RTL + MSW.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Apollo Client 3, GraphQL Codegen, React Router 6, React Hook Form, Zod, Lucide React, Vitest, MSW, Vercel.

---

## Conventions

- **Package manager:** `pnpm`.
- **TDD where it pays:** auth flow, ProtectedRoute, error mapping, idempotency. UI primitives don't strictly need TDD.
- **Commits:** Conventional commits, one per task unless noted.
- **No skips:** complete each task in order; later tasks reference earlier ones.

---

## Task 1: Bootstrap Vite + React + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- Modify: `.gitignore` (already present, fine)

- [ ] **Step 1: Scaffold Vite app**

```bash
pnpm create vite . --template react-ts
```

The CLI may complain the directory is not empty (we have `.git`, `.gitignore`, `docs/`). Choose to ignore or, if it refuses, scaffold in a temp dir and `rsync -a tmp/ ./` while preserving `.git/`, `.gitignore`, `docs/`.

- [ ] **Step 2: Install deps**

```bash
pnpm install
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Hits `http://localhost:5173`, sees the Vite + React landing. Stop with Ctrl-C.

- [ ] **Step 4: Strict TS config**

In `tsconfig.json`, ensure:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowImportingTsExtensions": false,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch"
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: bootstrap vite + react + typescript"
```

---

## Task 2: Tailwind + design tokens + fonts

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.cjs`
- Modify: `src/index.css`, `index.html`

- [ ] **Step 1: Install Tailwind**

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p
```

- [ ] **Step 2: Replace `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        accent: 'var(--color-accent)',
        destructive: 'var(--color-destructive)',
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        fg: 'var(--color-fg)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        ring: 'var(--color-ring)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontFeatureSettings: {
        tabular: '"tnum"',
      },
      transitionDuration: { '120': '120ms' },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --color-primary: #2563EB;
  --color-on-primary: #FFFFFF;
  --color-accent: #059669;
  --color-destructive: #DC2626;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-fg: #0F172A;
  --color-muted: #F1F5FD;
  --color-border: #E4ECFC;
  --color-ring: #2563EB;
}

@layer base {
  html { font-family: 'Inter', system-ui, sans-serif; }
  body { background-color: var(--color-bg); color: var(--color-fg); }
  h1, h2, h3 { font-family: 'Cormorant Garamond', Georgia, serif; }
  .tabular { font-feature-settings: 'tnum'; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Replace `src/App.tsx` with token smoke test**

```tsx
export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-surface border border-border rounded-lg p-8 max-w-md">
        <h1 className="text-3xl mb-2">Nex Books</h1>
        <p className="text-fg/80 mb-4">Tailwind + tokens working.</p>
        <button className="bg-primary text-on-primary px-4 py-2 rounded transition-transform duration-120 active:scale-[0.97]">
          Primary CTA
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Run dev server, verify visually**

```bash
pnpm dev
```

Open `http://localhost:5173`. Confirm Cormorant heading, Inter body, blue button, light bg, rounded card.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.ts postcss.config.cjs src/index.css src/App.tsx index.html
git commit -m "feat: tailwind + design tokens + fonts"
```

---

## Task 3: Env validation + path aliases

**Files:**
- Create: `src/lib/env.ts`, `.env.example`, `.env.development`
- Modify: `vite.config.ts`, `tsconfig.json`

- [ ] **Step 1: Install zod**

```bash
pnpm add zod
```

- [ ] **Step 2: Write `src/lib/env.ts`**

```ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
});

export const env = envSchema.parse(import.meta.env);
export type Env = z.infer<typeof envSchema>;
```

- [ ] **Step 3: Write `.env.example`**

```
VITE_API_URL=http://localhost:4000/graphql
```

- [ ] **Step 4: Write `.env.development`** (gitignored automatically by `.env.*` rule)

```
VITE_API_URL=http://localhost:4000/graphql
```

- [ ] **Step 5: Add path alias `@/`**

In `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

In `tsconfig.json`:

```json
"baseUrl": ".",
"paths": { "@/*": ["src/*"] }
```

- [ ] **Step 6: Commit**

```bash
git add src/lib .env.example vite.config.ts tsconfig.json
git commit -m "feat: env validation with zod + @ path alias"
```

---

## Task 4: GraphQL Codegen setup

**Files:**
- Create: `codegen.ts`, `src/graphql/operations/_placeholder.graphql`
- Modify: `package.json`

- [ ] **Step 1: Install codegen**

```bash
pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

- [ ] **Step 2: Write `codegen.ts`**

```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.VITE_API_URL ?? 'http://localhost:4000/graphql',
  documents: ['src/**/*.graphql', 'src/**/*.{ts,tsx}'],
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      presetConfig: { gqlTagName: 'gql', fragmentMasking: false },
    },
  },
  ignoreNoDocuments: true,
};
export default config;
```

- [ ] **Step 3: Write a placeholder so codegen can run**

`src/graphql/operations/_placeholder.graphql`:

```graphql
query _Placeholder { __typename }
```

- [ ] **Step 4: Run codegen against the live backend**

This requires the backend running locally (Task 22 of the back plan). If the back is not yet up, defer this step and run it after Task 14 of this plan when we wire actual operations.

```bash
pnpm codegen
```

If the backend is not reachable, an error is fine — we'll re-run later. Continue with the next task.

- [ ] **Step 5: Commit**

```bash
git add codegen.ts src/graphql package.json pnpm-lock.yaml
git commit -m "feat: graphql-codegen with client preset"
```

---

## Task 5: Apollo Client setup

**Files:**
- Create: `src/graphql/client.ts`, `src/graphql/operations/auth.graphql`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install Apollo**

```bash
pnpm add @apollo/client graphql
```

- [ ] **Step 2: Write `src/graphql/client.ts`**

```ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { env } from '@/lib/env';

const TOKEN_KEY = 'auth.token';

export function getStoredToken() { return localStorage.getItem(TOKEN_KEY); }
export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const httpLink = new HttpLink({ uri: env.VITE_API_URL });

const authLink = setContext((_, { headers }) => {
  const token = getStoredToken();
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } };
});

const errorLink = onError(({ graphQLErrors }) => {
  const unauth = graphQLErrors?.some(e => e.extensions?.code === 'UNAUTHENTICATED' || e.extensions?.code === 'FORBIDDEN');
  if (unauth) {
    setStoredToken(null);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first' },
  },
});
```

- [ ] **Step 3: Write first operations**

`src/graphql/operations/auth.graphql`:

```graphql
query Me { me { id name email role createdAt } }

mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    user { id name email role createdAt }
  }
}

mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    user { id name email role createdAt }
  }
}
```

- [ ] **Step 4: Wire ApolloProvider**

`src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { client } from '@/graphql/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 5: Install React Router**

```bash
pnpm add react-router-dom
```

- [ ] **Step 6: Commit**

```bash
git add src/graphql src/main.tsx package.json pnpm-lock.yaml
git commit -m "feat: apollo client + auth/error links + router setup"
```

---

## Task 6: AuthContext + useAuth (TDD)

**Files:**
- Create: `src/auth/AuthContext.tsx`, `src/auth/useAuth.ts`, `src/auth/AuthContext.test.tsx`

- [ ] **Step 1: Install test deps**

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

- [ ] **Step 2: Configure Vitest**

Add to `vite.config.ts`:

```ts
/// <reference types="vitest" />
// in defineConfig:
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test-setup.ts'],
  css: false,
},
```

Create `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Write the failing test**

`src/auth/AuthContext.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { setStoredToken } from '@/graphql/client';

function Probe() {
  const { user, accessToken, isAdmin, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <button onClick={() => login('tok-123', { id: '1', name: 'A', email: 'a@x.t', role: 'ADMIN' as any, createdAt: new Date().toISOString() })}>L</button>
      <button onClick={logout}>O</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => { setStoredToken(null); localStorage.clear(); });

  it('starts with no user', () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('email').textContent).toBe('none');
    expect(screen.getByTestId('admin').textContent).toBe('false');
  });

  it('login stores token and user; logout clears them', () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    act(() => screen.getByText('L').click());
    expect(screen.getByTestId('email').textContent).toBe('a@x.t');
    expect(screen.getByTestId('admin').textContent).toBe('true');
    expect(localStorage.getItem('auth.token')).toBe('tok-123');
    act(() => screen.getByText('O').click());
    expect(screen.getByTestId('email').textContent).toBe('none');
    expect(localStorage.getItem('auth.token')).toBeNull();
  });
});
```

- [ ] **Step 4: Run test, see RED**

```bash
pnpm test -- AuthContext
```

Expected: FAIL (component does not exist).

- [ ] **Step 5: Implement AuthContext**

`src/auth/AuthContext.tsx`:

```tsx
import { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { setStoredToken, getStoredToken } from '@/graphql/client';

export interface AuthUser {
  id: string; name: string; email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface AuthContextShape {
  user: AuthUser | null;
  accessToken: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextShape | null>(null);

const USER_KEY = 'auth.user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) as AuthUser : null; } catch { return null; }
  });

  const login = useCallback((token: string, u: AuthUser) => {
    setStoredToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setAccessToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user, accessToken, isAdmin: user?.role === 'ADMIN', isAuthenticated: !!accessToken,
    login, logout,
  }), [user, accessToken, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

`src/auth/useAuth.ts`:

```ts
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
```

- [ ] **Step 6: Run tests, see GREEN**

```bash
pnpm test -- AuthContext
```

- [ ] **Step 7: Wire AuthProvider into main.tsx**

```tsx
// inside ApolloProvider:
<AuthProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</AuthProvider>
```

- [ ] **Step 8: Commit**

```bash
git add src/auth src/main.tsx vite.config.ts src/test-setup.ts package.json
git commit -m "feat(auth): AuthContext with persistence + tests"
```

---

## Task 7: ProtectedRoute (TDD)

**Files:**
- Create: `src/auth/ProtectedRoute.tsx`, `src/auth/ProtectedRoute.test.tsx`
- Create: `src/components/layout/ForbiddenView.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/auth/ProtectedRoute.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

function renderAt(path: string, role?: 'USER' | 'ADMIN', authedRole?: 'USER' | 'ADMIN') {
  if (authedRole) {
    localStorage.setItem('auth.token', 'tok');
    localStorage.setItem('auth.user', JSON.stringify({ id: '1', name: 'X', email: 'x@x.t', role: authedRole, createdAt: new Date().toISOString() }));
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>LOGIN</div>} />
          <Route element={<ProtectedRoute role={role} />}>
            <Route path="/secret" element={<div>SECRET</div>} />
            <Route path="/admin" element={<div>ADMIN</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear());

  it('redirects to /login when no session', () => {
    renderAt('/secret');
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
  });

  it('renders children when authed and no role required', () => {
    renderAt('/secret', undefined, 'USER');
    expect(screen.getByText('SECRET')).toBeInTheDocument();
  });

  it('renders 403 when role insufficient', () => {
    renderAt('/admin', 'ADMIN', 'USER');
    expect(screen.getByText(/sin permisos/i)).toBeInTheDocument();
  });

  it('renders children when role matches', () => {
    renderAt('/admin', 'ADMIN', 'ADMIN');
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement ForbiddenView**

```tsx
// src/components/layout/ForbiddenView.tsx
import { Lock } from 'lucide-react';

export function ForbiddenView() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Lock aria-hidden className="w-12 h-12 text-fg/40 mb-4" />
      <h2 className="text-2xl mb-2">Sin permisos</h2>
      <p className="text-fg/70 max-w-md">No tienes acceso a esta sección. Contacta a un administrador si crees que esto es un error.</p>
    </div>
  );
}
```

```bash
pnpm add lucide-react
```

- [ ] **Step 3: Implement ProtectedRoute**

```tsx
// src/auth/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ForbiddenView } from '@/components/layout/ForbiddenView';

export function ProtectedRoute({ role }: { role?: 'USER' | 'ADMIN' }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (role === 'ADMIN' && user?.role !== 'ADMIN') {
    return <ForbiddenView />;
  }
  return <Outlet />;
}
```

- [ ] **Step 4: Run tests, see GREEN**

```bash
pnpm test -- ProtectedRoute
```

- [ ] **Step 5: Commit**

```bash
git add src/auth src/components/layout/ForbiddenView.tsx package.json
git commit -m "feat(auth): ProtectedRoute with role gate + tests"
```

---

## Task 8: UI primitives (Button, Input, Card, Skeleton, EmptyState, Spinner, Badge)

**Files:**
- Create: `src/components/ui/Button.tsx`, `Input.tsx`, `Label.tsx`, `Card.tsx`, `Skeleton.tsx`, `EmptyState.tsx`, `Spinner.tsx`, `Badge.tsx`, `index.ts`

- [ ] **Step 1: Button**

```tsx
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-muted text-fg hover:bg-border',
  ghost: 'bg-transparent text-fg hover:bg-muted',
  destructive: 'bg-destructive text-white hover:opacity-90',
};

export const Button = forwardRef<HTMLButtonElement, Props>(({ variant = 'primary', loading, disabled, className = '', children, ...rest }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`
      inline-flex items-center gap-2 px-4 py-2 rounded font-medium
      transition-transform duration-120 active:scale-[0.97]
      focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring
      disabled:opacity-50 disabled:cursor-not-allowed
      cursor-pointer min-h-11
      ${styles[variant]} ${className}
    `}
    {...rest}
  >
    {loading && <Loader2 aria-hidden className="w-4 h-4 animate-spin" />}
    {children}
  </button>
));
Button.displayName = 'Button';
```

- [ ] **Step 2: Input + Label**

```tsx
// src/components/ui/Label.tsx
import { LabelHTMLAttributes } from 'react';
export function Label({ className = '', children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`block text-sm font-medium mb-1 ${className}`} {...rest}>{children}</label>;
}
```

```tsx
// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
interface Props extends InputHTMLAttributes<HTMLInputElement> { error?: boolean; }
export const Input = forwardRef<HTMLInputElement, Props>(({ error, className = '', ...rest }, ref) => (
  <input
    ref={ref}
    className={`
      w-full px-3 py-2 rounded border bg-surface text-fg
      focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring
      disabled:opacity-50 min-h-11
      ${error ? 'border-destructive' : 'border-border'}
      ${className}
    `}
    {...rest}
  />
));
Input.displayName = 'Input';
```

- [ ] **Step 3: Card, Skeleton, Spinner, Badge, EmptyState**

```tsx
// src/components/ui/Card.tsx
import { HTMLAttributes } from 'react';
export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-surface border border-border rounded-lg p-4 ${className}`} {...rest}>{children}</div>;
}
```

```tsx
// src/components/ui/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}
```

```tsx
// src/components/ui/Spinner.tsx
import { Loader2 } from 'lucide-react';
export function Spinner({ size = 24 }: { size?: number }) {
  return <Loader2 aria-hidden className="animate-spin text-fg/60" width={size} height={size} />;
}
```

```tsx
// src/components/ui/Badge.tsx
type Tone = 'green' | 'blue' | 'yellow' | 'slate' | 'red';
const tones: Record<Tone, string> = {
  green: 'bg-accent/15 text-accent',
  blue: 'bg-primary/15 text-primary',
  yellow: 'bg-yellow-100 text-yellow-800',
  slate: 'bg-muted text-fg/70',
  red: 'bg-destructive/15 text-destructive',
};
export function Badge({ tone = 'slate', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
```

```tsx
// src/components/ui/EmptyState.tsx
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      <Icon aria-hidden className="w-12 h-12 text-fg/40 mb-4" />
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-fg/70 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
```

- [ ] **Step 4: Barrel index**

```ts
// src/components/ui/index.ts
export * from './Button';
export * from './Input';
export * from './Label';
export * from './Card';
export * from './Skeleton';
export * from './Spinner';
export * from './Badge';
export * from './EmptyState';
```

- [ ] **Step 5: Smoke render in App.tsx**

Replace `App.tsx` content with a small showcase that renders Button + Input + Badge + Card to confirm. After verifying, leave a minimal placeholder; we'll wire routes in Task 10.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui src/App.tsx
git commit -m "feat(ui): primitives — Button, Input, Card, Skeleton, EmptyState, Badge, Spinner"
```

---

## Task 9: Modal primitive

**Files:**
- Create: `src/components/ui/Modal.tsx`

- [ ] **Step 1: Implement Modal with focus trap**

```tsx
// src/components/ui/Modal.tsx
import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium">{title}</h2>
          <button aria-label="Cerrar" onClick={onClose} className="p-1 rounded hover:bg-muted focus:outline focus:outline-2 focus:outline-ring">
            <X aria-hidden className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Modal.tsx
git commit -m "feat(ui): Modal with focus trap + esc + scrim"
```

---

## Task 10: Toast / Toaster

**Files:**
- Create: `src/components/ui/Toaster.tsx`, `src/components/ui/useToast.ts`

- [ ] **Step 1: Implement**

```tsx
// src/components/ui/Toaster.tsx
import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type Variant = 'success' | 'error' | 'info';
interface Toast { id: string; variant: Variant; message: string; }

const ToastCtx = createContext<{ push: (variant: Variant, message: string) => void } | null>(null);

const icons: Record<Variant, typeof CheckCircle2> = { success: CheckCircle2, error: AlertCircle, info: Info };
const colors: Record<Variant, string> = {
  success: 'bg-accent/15 text-accent border-accent/30',
  error: 'bg-destructive/15 text-destructive border-destructive/30',
  info: 'bg-primary/15 text-primary border-primary/30',
};

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = (id: string) => setToasts(t => t.filter(x => x.id !== id));
  const push = useCallback((variant: Variant, message: string) => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, variant, message }]);
    setTimeout(() => remove(id), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div role="region" aria-live="polite" aria-label="Notificaciones" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => {
          const Icon = icons[t.variant];
          return (
            <div key={t.id} className={`flex items-start gap-2 px-4 py-3 rounded border ${colors[t.variant]} shadow-sm bg-surface min-w-[260px]`}>
              <Icon aria-hidden className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="flex-1 text-sm">{t.message}</p>
              <button aria-label="Cerrar" onClick={() => remove(t.id)} className="p-0.5 rounded hover:bg-muted">
                <X aria-hidden className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToasterProvider>');
  return ctx;
}
```

- [ ] **Step 2: Wire into main.tsx**

Wrap `<App />` with `<ToasterProvider>` inside `<AuthProvider>`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui src/main.tsx
git commit -m "feat(ui): Toaster with aria-live polite"
```

---

## Task 11: Errors mapping (TDD)

**Files:**
- Create: `src/lib/errors.ts`, `src/lib/errors.test.ts`

- [ ] **Step 1: Failing test**

```ts
// src/lib/errors.test.ts
import { describe, it, expect } from 'vitest';
import { mapErrorToMessage } from './errors';

describe('mapErrorToMessage', () => {
  it('maps known codes to user messages in Spanish', () => {
    expect(mapErrorToMessage('MAX_ACTIVE_RESERVATIONS')).toMatch(/3 libros/i);
    expect(mapErrorToMessage('NO_COPIES_AVAILABLE')).toMatch(/ejemplares/i);
    expect(mapErrorToMessage('INVALID_CREDENTIALS')).toMatch(/credenciales/i);
    expect(mapErrorToMessage('EMAIL_ALREADY_EXISTS')).toMatch(/correo|email/i);
    expect(mapErrorToMessage('FORBIDDEN')).toMatch(/permisos/i);
    expect(mapErrorToMessage('BOOK_HAS_ACTIVE_RESERVATIONS')).toMatch(/reservas activas/i);
    expect(mapErrorToMessage('COPY_NOT_AVAILABLE')).toMatch(/disponible/i);
    expect(mapErrorToMessage('RESERVATION_NOT_ACTIVE')).toMatch(/activa/i);
  });

  it('falls back gracefully for unknown codes', () => {
    expect(mapErrorToMessage('SOME_NEW_CODE')).toBe('Ocurrió un error inesperado.');
    expect(mapErrorToMessage(undefined)).toBe('Ocurrió un error inesperado.');
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/errors.ts
const messages: Record<string, string> = {
  MAX_ACTIVE_RESERVATIONS: 'Ya tienes 3 libros reservados. Devuelve uno antes de reservar otro.',
  NO_COPIES_AVAILABLE: 'Este libro ya no tiene ejemplares disponibles.',
  INVALID_CREDENTIALS: 'Credenciales inválidas. Verifica tu correo y contraseña.',
  EMAIL_ALREADY_EXISTS: 'Este correo ya está registrado.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  UNAUTHENTICATED: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  BOOK_HAS_ACTIVE_RESERVATIONS: 'No se puede eliminar: el libro tiene reservas activas.',
  COPY_NOT_AVAILABLE: 'El ejemplar no está disponible para esta operación.',
  RESERVATION_NOT_ACTIVE: 'Esta reserva ya no está activa.',
  RACE_RETRY_EXHAUSTED: 'Hubo demasiada concurrencia. Inténtalo de nuevo.',
  INVALID_DUE_DATE: 'La fecha de devolución debe ser futura.',
  RESOURCE_CONFLICT: 'Conflicto al guardar. Inténtalo de nuevo.',
  NOT_FOUND: 'Recurso no encontrado.',
};

export function mapErrorToMessage(code?: string | null): string {
  if (!code) return 'Ocurrió un error inesperado.';
  return messages[code] ?? 'Ocurrió un error inesperado.';
}

export function extractErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || !error) return undefined;
  const e: any = error;
  return e.graphQLErrors?.[0]?.extensions?.code ?? e.cause?.extensions?.code;
}
```

- [ ] **Step 3: Run, GREEN, commit**

```bash
pnpm test -- errors.test
git add src/lib/errors.ts src/lib/errors.test.ts
git commit -m "feat(errors): error code → user message mapping with tests"
```

---

## Task 12: AppShell + Sidebar + Topbar

**Files:**
- Create: `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `NavMenu.tsx`

- [ ] **Step 1: Implement AppShell**

```tsx
// src/components/layout/AppShell.tsx
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex flex-1">
        <Sidebar drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement Topbar**

```tsx
// src/components/layout/Topbar.tsx
import { Menu, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <header className="bg-surface border-b border-border h-14 flex items-center px-4 gap-4">
      <button onClick={onMenuClick} aria-label="Abrir menú" className="lg:hidden p-2 rounded hover:bg-muted">
        <Menu aria-hidden className="w-5 h-5" />
      </button>
      <Link to="/" className="flex items-center gap-2 font-serif text-xl">
        <BookOpen aria-hidden className="w-6 h-6 text-primary" />
        Nex Books
      </Link>
      <div className="flex-1" />
      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-fg/70 hidden sm:inline">{user?.email}</span>
          <button onClick={handleLogout} className="inline-flex items-center gap-1 text-sm hover:text-primary">
            <LogOut aria-hidden className="w-4 h-4" /> Salir
          </button>
        </div>
      ) : (
        <Link to="/login" className="text-sm hover:text-primary">Iniciar sesión</Link>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Implement NavMenu + Sidebar**

```tsx
// src/components/layout/NavMenu.tsx
import { NavLink } from 'react-router-dom';
import { BookOpen, ListChecks, Library, ClipboardList, UserPlus, LucideIcon } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';

interface Item { to: string; label: string; icon: LucideIcon; adminOnly?: boolean; }

const items: Item[] = [
  { to: '/', label: 'Libros', icon: BookOpen },
  { to: '/my-reservations', label: 'Mis reservas', icon: ListChecks },
  { to: '/admin/books', label: 'Catálogo', icon: Library, adminOnly: true },
  { to: '/admin/reservations', label: 'Reservas', icon: ClipboardList, adminOnly: true },
  { to: '/admin/users/new', label: 'Crear usuario', icon: UserPlus, adminOnly: true },
];

export function NavMenu({ onItemClick }: { onItemClick?: () => void }) {
  const { isAdmin, isAuthenticated } = useAuth();
  const visible = items.filter(i => (i.adminOnly ? isAdmin : isAuthenticated || i.to === '/'));
  return (
    <nav className="flex flex-col py-2">
      {visible.map(({ to, label, icon: Icon, adminOnly }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 text-sm border-l-2 transition-colors
             ${isActive ? 'bg-muted text-primary border-primary font-medium' : 'border-transparent text-fg hover:bg-muted'}`
          }
        >
          <Icon aria-hidden className="w-4 h-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

```tsx
// src/components/layout/Sidebar.tsx
import { NavMenu } from './NavMenu';
import { X } from 'lucide-react';

export function Sidebar({ drawerOpen, onCloseDrawer }: { drawerOpen: boolean; onCloseDrawer: () => void }) {
  return (
    <>
      <aside className="hidden lg:block w-60 border-r border-border bg-surface min-h-[calc(100vh-3.5rem)]">
        <NavMenu />
      </aside>
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={onCloseDrawer} role="dialog" aria-modal="true">
          <aside className="bg-surface w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="h-14 flex items-center justify-end px-4 border-b border-border">
              <button aria-label="Cerrar menú" onClick={onCloseDrawer} className="p-2 rounded hover:bg-muted">
                <X aria-hidden className="w-5 h-5" />
              </button>
            </div>
            <NavMenu onItemClick={onCloseDrawer} />
          </aside>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout
git commit -m "feat(layout): app shell with sidebar + topbar + role-aware nav"
```

---

## Task 13: Routes wiring + page placeholders

**Files:**
- Modify: `src/App.tsx`
- Create: minimal placeholders for all pages so routes resolve

- [ ] **Step 1: Replace App.tsx with routes**

```tsx
// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { BooksListPage } from '@/pages/BooksListPage';
import { BookDetailPage } from '@/pages/BookDetailPage';
import { MyReservationsPage } from '@/pages/MyReservationsPage';
import { BooksManagePage } from '@/pages/admin/BooksManagePage';
import { BookFormPage } from '@/pages/admin/BookFormPage';
import { ReservationsPage } from '@/pages/admin/ReservationsPage';
import { CreateUserPage } from '@/pages/admin/CreateUserPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppShell />}>
        <Route path="/" element={<BooksListPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />

        <Route element={<ProtectedRoute role="USER" />}>
          <Route path="/my-reservations" element={<MyReservationsPage />} />
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin/books" element={<BooksManagePage />} />
          <Route path="/admin/books/new" element={<BookFormPage />} />
          <Route path="/admin/books/:id/edit" element={<BookFormPage />} />
          <Route path="/admin/reservations" element={<ReservationsPage />} />
          <Route path="/admin/users/new" element={<CreateUserPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

- [ ] **Step 2: Create placeholder pages**

For each path, create a file under `src/pages/` exporting a function component that renders `<h1 className="text-2xl">PageName</h1>`. Example:

```tsx
// src/pages/LoginPage.tsx
export function LoginPage() { return <h1 className="text-2xl">Login</h1>; }
```

Repeat for: `RegisterPage`, `BooksListPage`, `BookDetailPage`, `MyReservationsPage`, `NotFoundPage`. Under `src/pages/admin/`: `BooksManagePage`, `BookFormPage`, `ReservationsPage`, `CreateUserPage`.

- [ ] **Step 3: Run dev server, smoke navigation**

```bash
pnpm dev
```

Manually visit `/`, `/login`, `/register`, `/my-reservations` (should redirect), `/admin/books` (should redirect).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages
git commit -m "feat(routes): wire all routes with placeholders"
```

---

## Task 14: Login page (TDD with MSW)

**Files:**
- Create: `src/pages/LoginPage.tsx` (replace placeholder), `src/pages/LoginPage.test.tsx`
- Create: `src/test/msw.ts`

- [ ] **Step 1: MSW server**

```ts
// src/test/msw.ts
import { graphql, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = {
  loginInvalid: graphql.mutation('Login', () => HttpResponse.json({
    errors: [{ message: 'Invalid', extensions: { code: 'INVALID_CREDENTIALS' } }],
  })),
  loginValid: graphql.mutation('Login', () => HttpResponse.json({
    data: { login: { accessToken: 'tok-1', user: { id: '1', name: 'A', email: 'a@x.t', role: 'USER', createdAt: new Date().toISOString() } } },
  })),
};

export const server = setupServer();
```

In `src/test-setup.ts` add:

```ts
import { server } from './test/msw';
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Add `import { beforeAll, afterEach, afterAll } from 'vitest';` and install `pnpm add -D msw`.

- [ ] **Step 2: Failing test**

```tsx
// src/pages/LoginPage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ApolloProvider } from '@apollo/client';
import { MemoryRouter } from 'react-router-dom';
import { client } from '@/graphql/client';
import { AuthProvider } from '@/auth/AuthContext';
import { ToasterProvider } from '@/components/ui/Toaster';
import { LoginPage } from './LoginPage';
import { server, handlers } from '@/test/msw';

function renderLogin() {
  return render(
    <MemoryRouter>
      <ApolloProvider client={client}>
        <AuthProvider>
          <ToasterProvider>
            <LoginPage />
          </ToasterProvider>
        </AuthProvider>
      </ApolloProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('shows mapped error message on invalid credentials', async () => {
    server.use(handlers.loginInvalid);
    renderLogin();
    await userEvent.type(screen.getByLabelText(/correo/i), 'a@x.t');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Pass1234!');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/credenciales/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Implement LoginPage**

Install RHF:
```bash
pnpm add react-hook-form @hookform/resolvers
```

```tsx
// src/pages/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { gql, useMutation } from '@apollo/client';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button, Input, Label, Card } from '@/components/ui';
import { useAuth } from '@/auth/useAuth';
import { useToast } from '@/components/ui/Toaster';
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors';

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) { accessToken user { id name email role createdAt } }
  }
`;

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
type Form = z.infer<typeof schema>;

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<Form>({
    resolver: zodResolver(schema), mode: 'onBlur',
  });
  const [login] = useMutation(LOGIN);
  const auth = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();

  const onSubmit = async (data: Form) => {
    try {
      const res = await login({ variables: { input: data } });
      const { accessToken, user } = res.data.login;
      auth.login(accessToken, user);
      const from = params.get('from') ?? '/';
      nav(from, { replace: true });
    } catch (e) {
      const code = extractErrorCode(e);
      const msg = mapErrorToMessage(code);
      setError('root', { message: msg });
      toast.push('error', msg);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl mb-1">Bienvenido</h1>
        <p className="text-fg/70 mb-6">Inicia sesión para reservar libros.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" autoComplete="email"
              error={!!errors.email} aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-err' : undefined}
              {...register('email')} />
            {errors.email && <p id="email-err" className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="current-password"
              error={!!errors.password} aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'pwd-err' : undefined}
              {...register('password')} />
            {errors.password && <p id="pwd-err" className="text-sm text-destructive mt-1">{errors.password.message}</p>}
          </div>
          {errors.root && <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full">Entrar</Button>
        </form>
        <p className="mt-4 text-sm text-fg/70 text-center">
          ¿No tienes cuenta? <Link to="/register" className="text-primary hover:underline">Regístrate</Link>
        </p>
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: Run test, GREEN**

```bash
pnpm test -- LoginPage
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/LoginPage.tsx src/pages/LoginPage.test.tsx src/test/msw.ts src/test-setup.ts package.json
git commit -m "feat: login page with form validation + error mapping"
```

---

## Task 15: Register page

**Files:**
- Create: `src/pages/RegisterPage.tsx` (replace placeholder)

- [ ] **Step 1: Implement**

Mirror `LoginPage` structure with `RegisterInput { name, email, password }`. Schema:

```ts
const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Debe contener una letra')
    .regex(/[0-9]/, 'Debe contener un número'),
});
```

On success, call `auth.login(accessToken, user)` and redirect to `/`.

Use the `Register` mutation already declared in `src/graphql/operations/auth.graphql`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/RegisterPage.tsx
git commit -m "feat: register page"
```

---

## Task 16: Books list + book detail (4 states)

**Files:**
- Create: `src/graphql/operations/books.graphql`
- Replace: `src/pages/BooksListPage.tsx`, `src/pages/BookDetailPage.tsx`
- Create: `src/components/books/BookCard.tsx`, `BookCardSkeleton.tsx`, `AvailabilityBadge.tsx`

- [ ] **Step 1: Operations**

```graphql
# src/graphql/operations/books.graphql
fragment BookCore on Book {
  id title author isbn description totalCopies availableCopies createdAt updatedAt
}

query BooksList($available: Boolean) {
  books(available: $available) { ...BookCore }
}

query BookById($id: ID!) {
  book(id: $id) {
    ...BookCore
    copies { id code status }
  }
}
```

Run codegen against the running back: `pnpm codegen`. (If back not running, write the queries with manual `gql` tag instead and migrate later.)

- [ ] **Step 2: AvailabilityBadge**

```tsx
// src/components/books/AvailabilityBadge.tsx
import { Badge } from '@/components/ui';

export function AvailabilityBadge({ available, total }: { available: number; total: number }) {
  if (available === 0) return <Badge tone="red">Sin ejemplares</Badge>;
  if (available < total) return <Badge tone="blue">{available} de {total} disponibles</Badge>;
  return <Badge tone="green">{total} disponibles</Badge>;
}
```

- [ ] **Step 3: BookCard + skeleton**

```tsx
// src/components/books/BookCard.tsx
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { AvailabilityBadge } from './AvailabilityBadge';

export function BookCard({ book }: { book: { id: string; title: string; author: string; availableCopies: number; totalCopies: number } }) {
  return (
    <Link to={`/books/${book.id}`} className="block transition-transform duration-120 active:scale-[0.97]">
      <Card className="hover:border-primary/40 cursor-pointer h-full flex flex-col gap-2">
        <h3 className="text-xl">{book.title}</h3>
        <p className="text-fg/70 text-sm">{book.author}</p>
        <div className="mt-auto pt-2"><AvailabilityBadge available={book.availableCopies} total={book.totalCopies} /></div>
      </Card>
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <Card className="h-32"><div className="h-6 w-2/3 bg-muted animate-pulse rounded mb-2" /><div className="h-4 w-1/3 bg-muted animate-pulse rounded" /></Card>
  );
}
```

- [ ] **Step 4: BooksListPage with 4 states**

```tsx
// src/pages/BooksListPage.tsx
import { gql, useQuery } from '@apollo/client';
import { BookOpen } from 'lucide-react';
import { BookCard, BookCardSkeleton } from '@/components/books/BookCard';
import { EmptyState, Button } from '@/components/ui';

const BOOKS_LIST = gql`
  query BooksList { books { id title author totalCopies availableCopies } }
`;

export function BooksListPage() {
  const { loading, error, data, refetch } = useQuery(BOOKS_LIST);

  if (loading && !data) {
    return (
      <section>
        <h1 className="text-3xl mb-6">Catálogo</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1 className="text-3xl mb-6">Catálogo</h1>
        <div className="text-center py-12">
          <p className="mb-4 text-destructive">No se pudo cargar el catálogo.</p>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </div>
      </section>
    );
  }

  const books = data?.books ?? [];
  if (books.length === 0) {
    return (
      <section>
        <h1 className="text-3xl mb-6">Catálogo</h1>
        <EmptyState icon={BookOpen} title="Sin libros aún" description="No hay libros en el catálogo. Pídele a un administrador que añada algunos." />
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-3xl mb-6">Catálogo</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((b: any) => <BookCard key={b.id} book={b} />)}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: BookDetailPage**

Mirror BooksListPage with `BookById($id)`. Show title, author, ISBN, description, AvailabilityBadge. Include a "Reservar" button (wired in Task 17 to open modal). If not authenticated, button reads "Inicia sesión para reservar" and links to `/login?from=/books/:id`.

- [ ] **Step 6: Commit**

```bash
git add src/components/books src/pages/BooksListPage.tsx src/pages/BookDetailPage.tsx src/graphql/operations/books.graphql
git commit -m "feat(books): catalog list + detail with 4 states + availability badge"
```

---

## Task 17: ReserveBookModal (TDD — idempotency key)

**Files:**
- Create: `src/components/books/ReserveBookModal.tsx`, `src/components/books/ReserveBookModal.test.tsx`
- Create: `src/lib/idempotency.ts`
- Create: `src/graphql/operations/reservations.graphql`

- [ ] **Step 1: Idempotency helper**

```ts
// src/lib/idempotency.ts
export function newIdempotencyKey() { return crypto.randomUUID(); }
```

- [ ] **Step 2: Operations**

```graphql
# src/graphql/operations/reservations.graphql
fragment ReservationCore on Reservation {
  id reservedAt dueDate returnedAt status
  bookCopy { id code status book { id title author } }
  user { id name email }
}

mutation CreateReservation($input: CreateReservationInput!) {
  createReservation(input: $input) { ...ReservationCore }
}

mutation ReturnBook($id: ID!) {
  returnBook(reservationId: $id) { ...ReservationCore }
}

query MyReservations($filters: ReservationFiltersInput) {
  myReservations(filters: $filters) { ...ReservationCore }
}

query ReservationsByBook($bookId: ID!, $filters: ReservationFiltersInput) {
  reservationsByBook(bookId: $bookId, filters: $filters) { ...ReservationCore }
}

query ReservationsByUser($userId: ID!, $filters: ReservationFiltersInput) {
  reservationsByUser(userId: $userId, filters: $filters) { ...ReservationCore }
}
```

- [ ] **Step 3: Failing test (idempotency key in mutation vars)**

```tsx
// src/components/books/ReserveBookModal.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { graphql, HttpResponse } from 'msw';
import { server } from '@/test/msw';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/graphql/client';
import { MemoryRouter } from 'react-router-dom';
import { ToasterProvider } from '@/components/ui/Toaster';
import { ReserveBookModal } from './ReserveBookModal';

describe('ReserveBookModal', () => {
  it('sends idempotencyKey with the mutation', async () => {
    const seen: any[] = [];
    server.use(
      graphql.mutation('CreateReservation', async ({ variables }) => {
        seen.push(variables);
        return HttpResponse.json({ data: { createReservation: {
          id: 'r-1', reservedAt: new Date().toISOString(), dueDate: new Date(Date.now() + 86400000).toISOString(),
          returnedAt: null, status: 'ACTIVE',
          bookCopy: { id: 'c1', code: 'X-1', status: 'RESERVED', book: { id: 'b1', title: 'X', author: 'Y' } },
          user: { id: 'u1', name: 'A', email: 'a@x.t' },
        } } });
      }),
    );
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <ApolloProvider client={client}>
          <ToasterProvider>
            <ReserveBookModal open onClose={onClose}
              book={{ id: 'b1', title: 'X', author: 'Y', availableCopies: 1, totalCopies: 1 }} />
          </ToasterProvider>
        </ApolloProvider>
      </MemoryRouter>
    );
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    await userEvent.type(screen.getByLabelText(/devolución/i), tomorrow);
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    await screen.findByText(/reserva creada/i);
    expect(seen[0].input).toMatchObject({ bookId: 'b1' });
    expect(seen[0].input.idempotencyKey).toMatch(/[0-9a-f-]{36}/);
  });
});
```

- [ ] **Step 4: Implement modal**

```tsx
// src/components/books/ReserveBookModal.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { gql, useMutation } from '@apollo/client';
import { Modal, Button, Input, Label } from '@/components/ui';
import { useToast } from '@/components/ui/Toaster';
import { newIdempotencyKey } from '@/lib/idempotency';
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors';
import { AvailabilityBadge } from './AvailabilityBadge';

const CREATE = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) { id status }
  }
`;

const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
const max90 = () => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().slice(0, 10); };

const schema = z.object({
  dueDate: z.string().refine(v => new Date(v) > new Date(), 'Debe ser futura'),
});
type Form = z.infer<typeof schema>;

interface Props {
  open: boolean; onClose: () => void;
  book: { id: string; title: string; author: string; availableCopies: number; totalCopies: number };
}

export function ReserveBookModal({ open, onClose, book }: Props) {
  const idem = useMemo(newIdempotencyKey, [open]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const [create] = useMutation(CREATE);
  const toast = useToast();
  const nav = useNavigate();
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const onSubmit = async (data: Form) => {
    setSubmitErr(null);
    try {
      await create({ variables: { input: { bookId: book.id, dueDate: new Date(data.dueDate).toISOString(), idempotencyKey: idem } } });
      toast.push('success', 'Reserva creada');
      onClose();
      nav('/my-reservations');
    } catch (e) {
      const msg = mapErrorToMessage(extractErrorCode(e));
      setSubmitErr(msg);
      toast.push('error', msg);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Reservar "${book.title}"`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button form="reserve-form" type="submit" loading={isSubmitting}>Confirmar reserva</Button>
        </>
      }
    >
      <p className="text-sm text-fg/70 mb-3">{book.author}</p>
      <div className="mb-4"><AvailabilityBadge available={book.availableCopies} total={book.totalCopies} /></div>
      <form id="reserve-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Label htmlFor="dueDate">Fecha de devolución</Label>
        <Input id="dueDate" data-autofocus type="date" min={tomorrow()} max={max90()}
          error={!!errors.dueDate} aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? 'due-err' : 'due-help'}
          {...register('dueDate')} />
        {errors.dueDate
          ? <p id="due-err" className="text-sm text-destructive mt-1">{errors.dueDate.message}</p>
          : <p id="due-help" className="text-sm text-fg/60 mt-1">Hasta 90 días desde hoy.</p>}
        {submitErr && <p role="alert" className="text-sm text-destructive mt-2">{submitErr}</p>}
      </form>
    </Modal>
  );
}
```

- [ ] **Step 5: Wire into BookDetailPage**

Open the modal on click, pass the book. Hide button if `availableCopies === 0`.

- [ ] **Step 6: Run test**

```bash
pnpm test -- ReserveBookModal
```

- [ ] **Step 7: Commit**

```bash
git add src/components/books src/lib/idempotency.ts src/graphql/operations/reservations.graphql src/pages/BookDetailPage.tsx
git commit -m "feat(reservations): reserve modal with idempotency + tests"
```

---

## Task 18: My reservations + Return modal

**Files:**
- Create: `src/pages/MyReservationsPage.tsx`, `src/components/reservations/ReservationRow.tsx`, `ReturnConfirmModal.tsx`

- [ ] **Step 1: ReservationRow**

```tsx
// src/components/reservations/ReservationRow.tsx
import { Badge, Button } from '@/components/ui';
import { format } from 'date-fns';

interface R { id: string; status: string; reservedAt: string; dueDate: string; returnedAt: string | null;
              bookCopy: { code: string; book: { id: string; title: string; author: string } }; }

export function ReservationRow({ reservation, onReturn }: { reservation: R; onReturn?: (id: string) => void }) {
  const r = reservation;
  return (
    <div className="bg-surface border border-border rounded p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg">{r.bookCopy.book.title}</h3>
          {r.status === 'ACTIVE' ? <Badge tone="blue">Activa</Badge> : <Badge tone="slate">Devuelta</Badge>}
        </div>
        <p className="text-sm text-fg/70">{r.bookCopy.book.author} · Ejemplar {r.bookCopy.code}</p>
        <p className="text-xs text-fg/60 tabular mt-1">
          Reservada: {format(new Date(r.reservedAt), 'yyyy-MM-dd')} · Vence: {format(new Date(r.dueDate), 'yyyy-MM-dd')}
          {r.returnedAt && ` · Devuelta: ${format(new Date(r.returnedAt), 'yyyy-MM-dd')}`}
        </p>
      </div>
      {r.status === 'ACTIVE' && onReturn && (
        <Button variant="secondary" onClick={() => onReturn(r.id)}>Devolver</Button>
      )}
    </div>
  );
}
```

```bash
pnpm add date-fns
```

- [ ] **Step 2: ReturnConfirmModal**

```tsx
// src/components/reservations/ReturnConfirmModal.tsx
import { gql, useMutation } from '@apollo/client';
import { Button, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/Toaster';
import { mapErrorToMessage, extractErrorCode } from '@/lib/errors';

const RETURN = gql`mutation ReturnBook($id: ID!) { returnBook(reservationId: $id) { id status returnedAt } }`;

export function ReturnConfirmModal({ open, onClose, reservation, onSuccess }: {
  open: boolean; onClose: () => void;
  reservation: { id: string; bookCopy: { book: { title: string } } } | null;
  onSuccess: () => void;
}) {
  const [run, { loading }] = useMutation(RETURN);
  const toast = useToast();
  if (!reservation) return null;

  const handle = async () => {
    try {
      await run({ variables: { id: reservation.id } });
      toast.push('success', 'Libro devuelto');
      onSuccess();
      onClose();
    } catch (e) {
      toast.push('error', mapErrorToMessage(extractErrorCode(e)));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Confirmar devolución" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" loading={loading} onClick={handle}>Confirmar</Button>
      </>
    }>
      <p>¿Confirmas la devolución de <strong>"{reservation.bookCopy.book.title}"</strong>?</p>
    </Modal>
  );
}
```

- [ ] **Step 3: MyReservationsPage**

```tsx
// src/pages/MyReservationsPage.tsx
import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, Spinner } from '@/components/ui';
import { ReservationRow } from '@/components/reservations/ReservationRow';
import { ReturnConfirmModal } from '@/components/reservations/ReturnConfirmModal';

const MY = gql`
  query MyReservations($filters: ReservationFiltersInput) {
    myReservations(filters: $filters) {
      id status reservedAt dueDate returnedAt
      bookCopy { id code book { id title author } }
    }
  }
`;

export function MyReservationsPage() {
  const { data, loading, error, refetch } = useQuery(MY);
  const [returning, setReturning] = useState<any | null>(null);

  if (loading && !data) return <div className="py-12 flex justify-center"><Spinner /></div>;
  if (error) return <div className="py-12 text-center"><p className="text-destructive mb-4">No se pudieron cargar tus reservas.</p><Button onClick={() => refetch()}>Reintentar</Button></div>;

  const reservations = data?.myReservations ?? [];

  return (
    <section>
      <h1 className="text-3xl mb-6">Mis reservas</h1>
      {reservations.length === 0 ? (
        <EmptyState icon={ListChecks} title="Aún no tienes reservas" description="Explora el catálogo y reserva un libro para empezar."
          action={<Link to="/" className="text-primary hover:underline">Ir al catálogo →</Link>} />
      ) : (
        <div className="flex flex-col gap-3">
          {reservations.map((r: any) => (
            <ReservationRow key={r.id} reservation={r} onReturn={() => setReturning(r)} />
          ))}
        </div>
      )}
      <ReturnConfirmModal open={!!returning} onClose={() => setReturning(null)} reservation={returning} onSuccess={() => refetch()} />
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/reservations src/pages/MyReservationsPage.tsx package.json
git commit -m "feat(reservations): my reservations + return confirm flow"
```

---

## Task 19: Admin Books CRUD (table + form + add/remove copies)

**Files:**
- Create: `src/pages/admin/BooksManagePage.tsx`, `BookFormPage.tsx`, `src/components/books/BookForm.tsx`

- [ ] **Step 1: Operations (extend `books.graphql`)**

```graphql
mutation CreateBook($input: CreateBookInput!) { createBook(input: $input) { ...BookCore } }
mutation UpdateBook($id: ID!, $input: UpdateBookInput!) { updateBook(id: $id, input: $input) { ...BookCore } }
mutation DeleteBook($id: ID!) { deleteBook(id: $id) }
mutation AddBookCopy($bookId: ID!) { addBookCopy(bookId: $bookId) { id code status } }
mutation RemoveBookCopy($copyId: ID!) { removeBookCopy(copyId: $copyId) }
```

- [ ] **Step 2: BooksManagePage (table)**

Render a table (mobile cards collapse via Tailwind responsive utilities) with columns: Título, Autor, Disponibles/Total, Acciones (Editar / Eliminar). Each delete confirms via Modal. Errors mapped to toasts.

- [ ] **Step 3: BookFormPage**

Form for create AND edit (same component, distinguishes by `:id?` route param). Fields: title, author, isbn, description, initialCopies (only on create). After create, redirects to `/admin/books/:id/edit` where the user can add/remove copies via buttons.

- [ ] **Step 4: BookForm component**

Reusable form (RHF + Zod). Schema:

```ts
const schema = z.object({
  title: z.string().min(1, 'Requerido'),
  author: z.string().min(1, 'Requerido'),
  isbn: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  initialCopies: z.coerce.number().int().min(1, 'Mínimo 1').optional(),
});
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin src/components/books src/graphql/operations
git commit -m "feat(admin): books CRUD with copy management"
```

---

## Task 20: Admin reservations with date filters + URL state

**Files:**
- Create: `src/pages/admin/ReservationsPage.tsx`, `src/components/reservations/ReservationFilters.tsx`

- [ ] **Step 1: ReservationFilters**

Filters: from (date), to (date), status (Todos/ACTIVE/RETURNED), bookId (optional select), userId (optional select). Use `useSearchParams` to reflect filters to URL. Debounce 300ms via `setTimeout` cleanup or a tiny custom hook.

- [ ] **Step 2: ReservationsPage**

```tsx
// shape:
const [params, setParams] = useSearchParams();
const filters = useMemo(() => buildFilters(params), [params]);
const { data, loading } = useQuery(RES_BY_USER_OR_BOOK, { variables: { ... filters } });
```

When `bookId` is set, query `reservationsByBook`; when `userId` is set, query `reservationsByUser`; if neither, show prompt: "Selecciona un libro o un usuario para ver sus reservas." (Backend doesn't expose a global "all reservations" query — admin must scope.)

Render results using `ReservationRow` (no return button — admin view).

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/ReservationsPage.tsx src/components/reservations/ReservationFilters.tsx
git commit -m "feat(admin): reservations page with date filters + URL state"
```

---

## Task 21: Admin create user

**Files:**
- Create: `src/pages/admin/CreateUserPage.tsx`
- Create: `src/graphql/operations/users.graphql`

- [ ] **Step 1: Operation**

```graphql
mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name email role createdAt } }
```

- [ ] **Step 2: Implement page**

Form (RHF + Zod): name, email, password, role (USER/ADMIN). On success, toast + reset form. Errors mapped via `mapErrorToMessage`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/CreateUserPage.tsx src/graphql/operations/users.graphql
git commit -m "feat(admin): create user page"
```

---

## Task 22: Code splitting + performance polish

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Convert page imports to lazy**

```tsx
import { lazy, Suspense } from 'react';
import { Spinner } from '@/components/ui';

const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
// ...same for the rest
```

Wrap the `<Routes>` in `<Suspense fallback={<div className="py-12 flex justify-center"><Spinner /></div>}>`.

Specifically defer all `/admin/*` pages so a USER never downloads their bundle.

- [ ] **Step 2: Run prod build, inspect chunks**

```bash
pnpm build
ls -lh dist/assets/
```

Confirm separate chunks for admin pages.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "perf: code split routes via React.lazy"
```

---

## Task 23: a11y + Lighthouse pass

**Files:** any final polish needed

- [ ] **Step 1: Manual a11y review**

For each page (`/`, `/login`, `/register`, `/my-reservations`, `/admin/books`, `/admin/reservations`):

- Tab from top — focus order matches visual order.
- All interactive elements have visible focus ring.
- Icon-only buttons have `aria-label`.
- Forms have visible labels (no placeholder-only).
- Errors are announced (`role="alert"` or `aria-live`).

Fix any issues inline.

- [ ] **Step 2: Run Lighthouse on `/` and `/login`**

```bash
pnpm build && pnpm preview
# In Chrome DevTools → Lighthouse → Accessibility audit
```

Target ≥ 95.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "a11y: fix focus, labels, aria-live based on Lighthouse pass"
```

---

## Task 24: Vercel config + README + deploy

**Files:**
- Create: `vercel.json`, `README.md`, `docs/screenshots/` (placeholder dir)

- [ ] **Step 1: vercel.json**

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "X-Frame-Options", "value": "DENY" }
    ]
  }],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: README**

```markdown
# Nex Books Reservation — Frontend

React + Vite + TypeScript + Tailwind + Apollo Client. Connects to the Nex Books reservation GraphQL API.

## Quick start

```bash
pnpm install
cp .env.example .env.development  # adjust VITE_API_URL
pnpm codegen                       # requires backend running
pnpm dev                           # http://localhost:5173
```

## Tests

```bash
pnpm test
```

## Build

```bash
pnpm build && pnpm preview
```

## Deploy

Connected to Vercel. Push to `main` triggers auto-deploy. Preview deploys per PR.

Set `VITE_API_URL` in Vercel project env: `https://api.<your-domain>/graphql`.

## Architecture

See `docs/superpowers/specs/2026-04-28-library-reservation-design.md`.

Test users (after backend seed):
- `admin@nex.test` / `Admin123!` (ADMIN)
- `ana@nex.test` / `User1234!` (USER)
- `bruno@nex.test` / `User1234!` (USER)
```

- [ ] **Step 3: Connect to Vercel**

Via CLI:

```bash
pnpm dlx vercel link
pnpm dlx vercel env add VITE_API_URL production   # paste backend URL
pnpm dlx vercel --prod
```

Or via the Vercel dashboard. Document either path in the README.

- [ ] **Step 4: Confirm production**

Open the deployed URL, register, browse books, reserve. Verify the API URL points to the production backend.

- [ ] **Step 5: Commit**

```bash
git add vercel.json README.md docs/screenshots
git commit -m "chore: vercel config + README"
```

---

## Spec coverage checklist

| Spec section | Tasks |
|--------------|-------|
| §3 Design system | T2 |
| §4 Layout | T12 |
| §5 Folder structure | T1, T6, T8 |
| §6 Routing | T13 |
| §7 State management | T5, T6 |
| §8 GraphQL operations | T4, T5, T16, T17, T19, T20, T21 |
| §9 Forms | T11, T14, T15, T17, T19, T21 |
| §10.1 Reserve flow | T16, T17 |
| §10.2 Return flow | T18 |
| §10.3 Admin filters | T20 |
| §10.4 Books CRUD | T19 |
| §10.5 Login/Register | T14, T15 |
| §11 Required states | T16, T18 |
| §12 Accessibility | T7, T8, T9, T23 |
| §13 Performance | T22 |
| §14 Errors mapping | T11 |
| §15 Env config | T3 |
| §16 Testing | T6, T7, T11, T14, T17 |
| §17 CI/CD (Vercel) | T24 |

---

## Execution mode

After this plan is committed:

1. **Subagent-driven (recommended)** — fresh subagent per task with two-stage review.
2. **Inline execution** — execute tasks in this session via `superpowers:executing-plans`.
