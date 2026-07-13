import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import StudyIcon from '../components/StudyIcon'
import { useAuth } from '../auth/AuthContext'

/* LoginPage */
const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()
  
  const [formData, setFormData]         = useState({ identifier: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError]     = useState(null)

  useEffect(() => {
    clearError()
  }, [clearError])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) clearError()
    if (localError) setLocalError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.identifier || !formData.password) {
      setLocalError("Please enter both identifier and password.")
      return
    }
    
    try {
      await login(formData)
      navigate('/dashboard')
    } catch {
      // Error is handled by AuthContext and exposed through `error`.
    }
  }

  return (
    <AuthLayout>
      {/* Header */}
      <header className="mb-7">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight mb-1.5">
          Welcome back
        </h1>
        <p className="text-stone-500 text-sm">Continue your learning flow.</p>
      </header>

      {/* Error Banner */}
      {(error || localError) && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 flex items-start gap-2 animate-fade-in">
          <StudyIcon name="alert-circle" size={16} className="mt-0.5 shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Identifier: email OR username */}
        <div>
          <label
            htmlFor="login-identifier"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Email or username
          </label>
          <input
            id="login-identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            placeholder="you@example.com or your username"
            value={formData.identifier}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <StudyIcon name={showPassword ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button id="login-submit-btn" type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Continue learning'}
          </button>
        </div>
      </form>

      {/* Switch to register */}
      <p className="mt-6 text-center text-sm text-stone-500">
        New to StudyFlow?{' '}
        <Link
          to="/register"
          className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
        >
          Create an account
        </Link>
      </p>

      {/* Legal */}
      <div className="mt-6 pt-6 border-t border-stone-100">
        <p className="text-xs text-stone-400 text-center leading-relaxed">
          By continuing, you agree to our{' '}
          <span className="text-stone-500 underline underline-offset-2 cursor-pointer hover:text-stone-700 transition-colors">
            Terms
          </span>{' '}
          and{' '}
          <span className="text-stone-500 underline underline-offset-2 cursor-pointer hover:text-stone-700 transition-colors">
            Privacy Policy
          </span>.
        </p>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
