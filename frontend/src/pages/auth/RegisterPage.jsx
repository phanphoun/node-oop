import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorMessage from '../../components/ui/ErrorMessage'
import FormInput from '../../components/ui/FormInput'
import { useAuth } from '../../context/useAuth'
import { ROLES } from '../../utils/constants'
import { card, eyebrow, h1, input, label as labelClass, primaryButton } from '../../utils/styles'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.buyer,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/')
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
          aria-label="Close register"
        >
          x
        </button>
        <p className={eyebrow}>Join BuyNow</p>
        <h1 className={h1}>Create account</h1>
        <ErrorMessage message={error} />
        <FormInput
          id="name"
          label="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
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
          minLength="6"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <label className={labelClass} htmlFor="role">
          <span>Account type</span>
          <select id="role" className={input} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value={ROLES.buyer}>Buyer</option>
            <option value={ROLES.seller}>Seller</option>
          </select>
        </label>
        <button type="submit" className={primaryButton} disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  )
}

