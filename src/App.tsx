import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { BooksListPage } from '@/pages/BooksListPage'
import { BookDetailPage } from '@/pages/BookDetailPage'
import { MyReservationsPage } from '@/pages/MyReservationsPage'
import { BooksManagePage } from '@/pages/admin/BooksManagePage'
import { BookFormPage } from '@/pages/admin/BookFormPage'
import { ReservationsPage } from '@/pages/admin/ReservationsPage'
import { CreateUserPage } from '@/pages/admin/CreateUserPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

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
  )
}
