import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import StudyIcon from '../components/StudyIcon'
import { useAuth } from '../auth/AuthContext'

/*  Password strength helper  */
const getStrength = (pw) => {
  if (!pw) return null
  let s = 0
  if (pw.length >= 8)           s++
  if (/[A-Z]/.test(pw))         s++
  if (/[0-9]/.test(pw))         s++
  if (/[^A-Za-z0-9]/.test(pw))  s++
  return [
    null,
    { label: 'Weak',   bar: 'bg-rose-400',    w: 'w-1/4' },
    { label: 'Fair',   bar: 'bg-amber-400',   w: 'w-2/4' },
    { label: 'Good',   bar: 'bg-lime-500',    w: 'w-3/4' },
    { label: 'Strong', bar: 'bg-emerald-500', w: 'w-full' },
  ][s]
}

/*  RegisterPage  */
const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuth()
  
  const [formData, setFormData]       = useState({
    username: '', email: '', password: '', confirmPassword: '',
  })
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwFocused, setPwFocused]     = useState(false)
  const [localError, setLocalError]   = useState(null)

  useEffect(() => {
    clearError()
  }, [clearError])

  const strength = getStrength(formData.password)
  const mismatch =
    formData.confirmPassword.length > 0 &&
    formData.confirmPassword !== formData.password

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) clearError()
    if (localError) setLocalError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (mismatch) {
      setLocalError("Passwords do not match.")
      return
    }
    
    if (!formData.username || !formData.email || !formData.password) {
      setLocalError("Please fill in all fields.")
      return
    }
    
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    }
    
    try {
      const data = await register(payload)
      // Navigate based on whether the API logs us in automatically
      // Usually if accessToken is returned, we are logged in.
      // If not, we might navigate to login. Let's just go to dashboard if token exists, else login.
      if (data && data.accessToken) {
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    } catch {
      // Error handled by AuthContext.
    }
  }

  return (
    <AuthLayout>
      {/*  Header  */}
      <header className="mb-7">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight mb-1.5">
          Create your StudyFlow account
        </h1>
        <p className="text-stone-500 text-sm">
          Start planning smarter study sessions.
        </p>
      </header>

      {/* Error Banner */}
      {(error || localError) && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 flex items-start gap-2 animate-fade-in">
          <StudyIcon name="alert-circle" size={16} className="mt-0.5 shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      {/*  Form  */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Username */}
        <div>
          <label
            htmlFor="register-username"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Username
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="e.g. alex_nguyen"
            value={formData.username}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Email address
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            {/* Password Policy Tooltip (Left Side) */}
            <div
              className={`absolute top-0 right-[calc(100%+1.5rem)] w-[240px] p-4 bg-white border border-stone-100 shadow-card-lg rounded-2xl transition-all duration-300 z-30 hidden md:block ${
                pwFocused || (formData.password.length > 0 && strength?.label !== 'Strong')
                  ? 'opacity-100 translate-x-0 pointer-events-auto'
                  : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
            >
              <h4 className="text-[11px] font-bold text-stone-800 mb-3 tracking-widest uppercase">
                Password rules
              </h4>
              <ul className="space-y-2.5">
                {[
                  { id: 'len', label: 'At least 8 characters', valid: formData.password.length >= 8 },
                  { id: 'up', label: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
                  { id: 'num', label: 'One number', valid: /[0-9]/.test(formData.password) },
                  { id: 'sp', label: 'One special character', valid: /[^A-Za-z0-9]/.test(formData.password) },
                ].map(req => (
                  <li key={req.id} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      req.valid ? 'bg-emerald-500' : 'bg-stone-100 border border-stone-200'
                    }`}>
                      {req.valid && <StudyIcon name="check" size={8} className="text-white" strokeWidth={4} />}
                    </div>
                    <span className={`text-xs ${req.valid ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                      {req.label}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Tooltip Arrow */}
              <div className="absolute top-[18px] -right-[5px] w-[10px] h-[10px] bg-white border-t border-r border-stone-100 rotate-45 transform origin-center" />
            </div>

            <input
              id="register-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <StudyIcon name={showPw ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>

          {/* Strength meter */}
          {strength && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="relative flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${strength.w} ${strength.bar} rounded-full transition-all duration-300`}
                />
              </div>
              <span className="text-xs text-stone-400 whitespace-nowrap w-12 text-right">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="register-confirmPassword"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="register-confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-field pr-12 ${
                mismatch ? 'border-rose-300 focus:ring-rose-400' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              <StudyIcon name={showConfirm ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>
          {mismatch && (
            <p className="mt-1.5 text-xs text-rose-500">Passwords do not match.</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button id="register-submit-btn" type="submit" className="btn-primary" disabled={isLoading || mismatch}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>

      {/*  Switch to login  */}
      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>

      {/*  Legal  */}
      <div className="mt-6 pt-6 border-t border-stone-100">
        <p className="text-xs text-stone-400 text-center leading-relaxed">
          By creating an account, you agree to our{' '}
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

export default RegisterPage
