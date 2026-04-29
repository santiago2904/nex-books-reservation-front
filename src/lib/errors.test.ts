import { describe, it, expect } from 'vitest'
import { mapErrorToMessage } from './errors'

describe('mapErrorToMessage', () => {
  it('maps known codes to user messages in Spanish', () => {
    expect(mapErrorToMessage('MAX_ACTIVE_RESERVATIONS')).toMatch(/3 libros/i)
    expect(mapErrorToMessage('NO_COPIES_AVAILABLE')).toMatch(/ejemplares/i)
    expect(mapErrorToMessage('INVALID_CREDENTIALS')).toMatch(/credenciales/i)
    expect(mapErrorToMessage('EMAIL_ALREADY_EXISTS')).toMatch(/correo|email/i)
    expect(mapErrorToMessage('FORBIDDEN')).toMatch(/permisos/i)
    expect(mapErrorToMessage('BOOK_HAS_ACTIVE_RESERVATIONS')).toMatch(/reservas activas/i)
    expect(mapErrorToMessage('COPY_NOT_AVAILABLE')).toMatch(/disponible/i)
    expect(mapErrorToMessage('RESERVATION_NOT_ACTIVE')).toMatch(/activa/i)
  })

  it('falls back gracefully for unknown codes', () => {
    expect(mapErrorToMessage('SOME_NEW_CODE')).toBe('Ocurrió un error inesperado.')
    expect(mapErrorToMessage(undefined)).toBe('Ocurrió un error inesperado.')
  })
})
