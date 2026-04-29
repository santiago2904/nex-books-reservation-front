import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { env } from '@/lib/env'

const TOKEN_KEY = 'auth.token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

const httpLink = new HttpLink({ uri: env.VITE_API_URL })

const authLink = setContext((_, { headers }) => {
  const token = getStoredToken()
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

const errorLink = onError(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    const unauth = error.errors.some(
      (e) =>
        e.extensions?.code === 'UNAUTHENTICATED' ||
        e.extensions?.code === 'FORBIDDEN',
    )
    if (unauth) {
      setStoredToken(null)
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.href = '/login'
      }
    }
  }
})

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first' },
  },
})
