import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const GQL = 'http://localhost:4000/graphql'

export const handlers = {
  loginInvalid: http.post(GQL, () =>
    HttpResponse.json({
      errors: [{ message: 'Invalid', extensions: { code: 'INVALID_CREDENTIALS' } }],
    }),
  ),
  loginValid: http.post(GQL, () =>
    HttpResponse.json({
      data: {
        login: {
          accessToken: 'tok-1',
          user: { id: '1', name: 'A', email: 'a@x.t', role: 'USER', createdAt: new Date().toISOString() },
        },
      },
    }),
  ),
  registerValid: http.post(GQL, () =>
    HttpResponse.json({
      data: {
        register: {
          accessToken: 'tok-2',
          user: { id: '2', name: 'B', email: 'b@x.t', role: 'USER', createdAt: new Date().toISOString() },
        },
      },
    }),
  ),
}

export const server = setupServer()
