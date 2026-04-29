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
}

export function mapErrorToMessage(code?: string | null): string {
  if (!code) return 'Ocurrió un error inesperado.'
  return messages[code] ?? 'Ocurrió un error inesperado.'
}

type GqlErrArray = Array<{ extensions?: { code?: string } }>

export function extractErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || !error) return undefined
  const e = error as Record<string, unknown>
  // Apollo v3: ApolloError.graphQLErrors
  const v3 = e['graphQLErrors'] as GqlErrArray | undefined
  if (v3?.[0]?.extensions?.code) return v3[0].extensions?.code
  // Apollo v4: CombinedGraphQLErrors.errors
  const v4 = e['errors'] as GqlErrArray | undefined
  if (v4?.[0]?.extensions?.code) return v4[0].extensions?.code
  // Nested in cause
  const cause = e['cause'] as Record<string, unknown> | undefined
  const causeV4 = cause?.['errors'] as GqlErrArray | undefined
  return causeV4?.[0]?.extensions?.code
}
