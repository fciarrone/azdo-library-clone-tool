import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { ThemeProvider } from './theme/ThemeProvider.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { WizardProvider } from './context/WizardContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WizardProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-background-primary)',
                  color: 'var(--color-foreground-primary)',
                  border: '1px solid var(--color-border-default)',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  boxShadow: 'var(--shadow-lg)',
                  fontSize: '14px',
                  fontWeight: '400',
                  lineHeight: '1.5',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--color-status-success)',
                    secondary: 'var(--color-status-success-bg)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--color-status-error)',
                    secondary: 'var(--color-status-error-bg)',
                  },
                },
              }}
              reverseOrder={true}
              gutters={16}
            />
          </WizardProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)