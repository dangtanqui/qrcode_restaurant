import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ErrorBoundary from './components/ErrorBoundary'
import { I18nProvider } from './contexts/I18nContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { CurrencyProvider } from './contexts/CurrencyContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import RestaurantSetup from './pages/RestaurantSetup'
import MenuEditor from './pages/MenuEditor'
import CustomerMenu from './pages/CustomerMenu'
import QRGenerator from './pages/QRGenerator'
import OrderManagement from './pages/OrderManagement'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }
  
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  // Suppress extension errors in console
  const originalError = console.error
  console.error = (...args: any[]) => {
    if (args[0]?.toString().includes('content.bundle.js') || 
        args[0]?.toString().includes('URL.parse')) {
      return // Ignore extension errors
    }
    originalError.apply(console, args)
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CurrencyProvider>
          <I18nProvider>
            <BrowserRouter>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/m/:slug" element={<CustomerMenu />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/restaurant/setup"
              element={
                <PrivateRoute>
                  <RestaurantSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/restaurant/:id/menu"
              element={
                <PrivateRoute>
                  <MenuEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/restaurant/:id/qr"
              element={
                <PrivateRoute>
                  <QRGenerator />
                </PrivateRoute>
              }
            />
            <Route
              path="/restaurant/:id/orders"
              element={
                <PrivateRoute>
                  <OrderManagement />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </BrowserRouter>
        </I18nProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App



