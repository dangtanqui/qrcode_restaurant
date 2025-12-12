import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../contexts/I18nContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data && data.token && data.user) {
        login(data.token, data.user)
        // Use setTimeout to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 100)
      } else {
        setError(t('auth.invalidResponse'))
      }
    },
    onError: (err: any) => {
      // Extract user-friendly error message
      let errorMessage = t('auth.loginFailed')
      
      if (err.response?.status === 401) {
        // For 401 errors, show invalid credentials message
        errorMessage = err.response?.data?.error || t('auth.invalidCredentials')
      } else if (err.response?.data?.error) {
        // Use server error message if available
        errorMessage = err.response.data.error
      } else if (err.message && !err.message.includes('Request failed')) {
        // Only use error message if it's not a generic network error
        errorMessage = err.message
      }
      
      setError(errorMessage)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    
    // Client-side validation
    if (!email.trim()) {
      setError(t('auth.emailRequired'))
      return
    }
    
    if (!password.trim()) {
      setError(t('auth.passwordRequired'))
      return
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError(t('auth.invalidEmailFormat'))
      return
    }
    
    mutation.mutate({ email: email.trim(), password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language and Theme Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageThemeSwitcher />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.or')}{' '}
            <Link to="/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
              {t('auth.createAccount')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowPassword(!showPassword)
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-20 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 pointer-events-none" />
                ) : (
                  <Eye className="h-5 w-5 pointer-events-none" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? t('auth.signingIn') : t('auth.login')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



