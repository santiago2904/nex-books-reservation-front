# Nex Books Reservation — Frontend

Aplicación web para gestionar reservas de libros de biblioteca. SPA construida con React 19, Vite, TypeScript, Tailwind CSS 4 y Apollo Client 4, consumiendo la API GraphQL del backend.

> **Repo backend:** [`nex-books-reservation-back`](https://github.com/santiago2904/nex-books-reservation-back)

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool |
| TypeScript | 6 | Tipado estático (strict mode) |
| Tailwind CSS | 4 | Estilos con CSS variables / `@theme` |
| Apollo Client | 4 | Capa de datos GraphQL |
| React Router | 7 | Routing SPA |
| React Hook Form + Zod | 7 / 4 | Formularios con validación |
| react-day-picker | 9 | Date picker (estilo shadcn) |
| Radix UI | — | Primitives: Popover, Select, DropdownMenu |
| Lucide React | — | Iconografía SVG |
| date-fns (locale es) | 4 | Formateo de fechas en español |
| Vitest + RTL + MSW | — | Testing |

---

## Funcionalidades

### Usuario autenticado (USER)
- Explorar el catálogo de libros con buscador y ordenación
- Ver detalle de libro con portada (Open Library API o URL personalizada)
- Reservar libro con selector de fecha tipo shadcn
- Ver historial de reservas (activas / devueltas)
- Devolver libro antes de la fecha de vencimiento

### Administrador (ADMIN)
- CRUD completo de libros con preview de portada en tiempo real
- Gestión de ejemplares físicos por libro (añadir / eliminar)
- Reservas: buscador full-text (título, autor, usuario), filtros de estado y rango de fechas
- Crear usuarios con selector de rol visual

---

## Quickstart

### Con Docker (recomendado)

El backend incluye un `docker-compose.yml` que levanta Postgres + API + seeds automáticamente.

```bash
# 1. Levantar backend
cd ../nex-books-reservation-back
docker compose up --build

# 2. Levantar frontend (otra terminal)
cd nex-books-reservation-front
pnpm install
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173).

### Sin Docker

```bash
pnpm install
cp .env.example .env.development   # ajustar VITE_API_URL si es necesario
pnpm dev
```

Requiere el backend corriendo en `http://localhost:4000`.

---

## Variables de entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/graphql` | Endpoint GraphQL del backend |

---

## Comandos

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm typecheck    # Verificación TypeScript
pnpm test         # Suite de pruebas (Vitest)
pnpm codegen      # Genera hooks tipados desde el schema GraphQL (requiere backend)
```

---

## Pruebas

```bash
pnpm test
```

**12 pruebas en 5 suites:**

| Suite | Tests | Qué cubre |
|---|---|---|
| `AuthContext.test.tsx` | 2 | Login/logout con persistencia en localStorage |
| `ProtectedRoute.test.tsx` | 4 | Redirect sin sesión, 403 por rol insuficiente, acceso correcto |
| `errors.test.ts` | 2 | Mapeo de códigos de error del backend a mensajes en español |
| `LoginPage.test.tsx` | 2 | Credenciales inválidas muestran mensaje mapeado; campos visibles |
| `ReserveBookModal.test.tsx` | 2 | `idempotencyKey` UUID presente en variables de la mutation; conteo de disponibles |

---

## Cuentas de prueba (seed del backend)

| Email | Contraseña | Rol |
|---|---|---|
| `admin@nex.test` | `Admin123!` | ADMIN |
| `ana@nex.test` | `User1234!` | USER |
| `bruno@nex.test` | `User1234!` | USER |

---

## Decisiones técnicas destacadas

### Apollo Client 4
En v4, `useMutation`/`useQuery`/`ApolloProvider` se importan desde `@apollo/client/react` (no desde `@apollo/client`). Los errores GraphQL llegan en `result.error.errors[]`, no se lanzan como excepciones. Esto afecta el manejo de errores en formularios.

### Tailwind 4
Usa `@theme {}` en CSS en lugar de `tailwind.config.ts`. Los tokens de color son CSS variables consumidas por clases como `bg-primary`, `text-fg`, etc.

### DatePicker personalizado
Construido con `react-day-picker` v9 + `@radix-ui/react-popover`. El calendario se abre como popover y permite selección en español (`date-fns/locale/es`).

### Portadas de libros
Prioridad: `coverUrl` (campo en la DB) → Open Library API via ISBN → placeholder con iniciales del título.

### Tests con Apollo v4
`useMutation` se mockea con `vi.hoisted` + `vi.mock('@apollo/client/react')` para evitar problemas de TDZ en los factories de Vitest. `DatePicker` se mockea como `<input type="date">` ya que `@radix-ui/react-popover` no renderiza en jsdom.

### Logout simbólico (v1)
El logout limpia el token del localStorage y el cache de Apollo. Sin refresh tokens ni revocación server-side — v1 deliberado documentado en el backend.

---

## Deploy en Vercel

```bash
# Conectar repo y configurar variable de entorno
vercel env add VITE_API_URL production
vercel --prod
```

`vercel.json` incluye SPA rewrite y headers de seguridad (HSTS, X-Content-Type, Referrer-Policy, X-Frame-Options).
