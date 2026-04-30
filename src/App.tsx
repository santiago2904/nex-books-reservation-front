import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { Spinner } from '@/components/ui'

// Public pages — eager loaded (landing + auth, tiny bundles)
import { BooksListPage } from '@/pages/BooksListPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Lazy-loaded: auth pages rarely needed once logged in
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))

// Lazy-loaded: authenticated user pages
const BookDetailPage = lazy(() => import('@/pages/BookDetailPage').then((m) => ({ default: m.BookDetailPage })))
const MyReservationsPage = lazy(() => import('@/pages/MyReservationsPage').then((m) => ({ default: m.MyReservationsPage })))

// Lazy-loaded: admin bundle — never downloaded by USER role
const BooksManagePage = lazy(() => import('@/pages/admin/BooksManagePage').then((m) => ({ default: m.BooksManagePage })))
const BookFormPage = lazy(() => import('@/pages/admin/BookFormPage').then((m) => ({ default: m.BookFormPage })))
const ReservationsPage = lazy(() => import('@/pages/admin/ReservationsPage').then((m) => ({ default: m.ReservationsPage })))
const CreateUserPage = lazy(() => import('@/pages/admin/CreateUserPage').then((m) => ({ default: m.CreateUserPage })))

function PageFallback() {
  return (
    <div className="py-12 flex justify-center">
      <Spinner />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  )
}
