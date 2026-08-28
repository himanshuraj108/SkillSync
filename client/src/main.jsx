import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

const saved = JSON.parse(localStorage.getItem('ss_theme') || '{}')
const theme = saved?.state?.theme || 'light'
if (theme === 'dark') document.documentElement.classList.add('dark')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#171717',
              color: '#f5f5f5',
              border: '1px solid #262626',
            },
          }} 
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
