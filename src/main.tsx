import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import { BrowserRouter } from 'react-router-dom'
import { client } from '@/graphql/client'
import { AuthProvider } from '@/auth/AuthContext'
import { ToasterProvider } from '@/components/ui/Toaster'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <ToasterProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToasterProvider>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
