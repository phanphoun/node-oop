import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ErrorMessage from '../../components/ui/ErrorMessage'
import FormInput from '../../components/ui/FormInput'
import { useAuth } from '../../context/useAuth'
import { card, eyebrow, h1, primaryButton } from '../../utils/styles'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/35 px-4 py-8 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <form className={`${card} relative grid w-full max-w-md gap-4 p-6 shadow-2xl`} onSubmit={submit}>
        <button
          type="button"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          onClick={() => navigate('/')}
          aria-label="Close login"
        >
          x
        </button>
        <p className={eyebrow}>Welcome back</p>
        <h1 className={h1}>Login</h1>
        <ErrorMessage message={error} />
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <FormInput
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <button type="submit" className={primaryButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p>
          New to BuyNow? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  )
}

