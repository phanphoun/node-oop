import { useCallback, useState } from 'react'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAsync } from '../../hooks/useAsync'
import {
  dangerButton,
  ghostButton,
  h2,
  input,
  managementLayout,
  page,
  primaryButton,
  tableCard,
} from '../../utils/styles'

const emptyForm = { name: '', email: '', password: '', phone: '', address: '' }

export default function AdminUsersPage() {
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const state = useAsync(useCallback(() => api.get('/admin/users'), []), [])

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      if (editing) {
        await api.put(`/admin/business-owner/${editing.id}`, {
          name: form.name,
          phone: form.phone,
          address: form.address,
        })
      } else {
        await api.post('/admin/business-owner', form)
      }
      setForm(emptyForm)
      setEditing(null)
      state.execute().catch(() => {})
    } catch (err) {
      setMessage(err.message)
    }
  }

  const edit = (user) => {
    setEditing(user)
    setForm({ name: user.name || '', email: user.email || '', password: '', phone: user.phone || '', address: user.address || '' })
  }

  const removeUser = async (user) => {
    if (!user.status || !window.confirm(`Remove ${user.name || user.email}? This will deactivate the account.`)) {
      return
    }

    try {
      setMessage('')
      await api.delete(`/admin/users/${user.id}`)
      state.execute().catch(() => {})
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <section className={page}>
      <PageHeader eyebrow="Admin" title="Users" description="Review customers, manage owners, and remove inactive accounts from marketplace access." />
      <ErrorMessage message={state.error || message} />
      <div className={managementLayout}>
        <form className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={submit}>
          <h2 className={h2}>{editing ? 'Edit business owner' : 'Create business owner'}</h2>
          <div className="mt-4 grid gap-3">
            <input className={input} placeholder="Name" autoComplete="off" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <input className={input} placeholder="Email" type="email" autoComplete="off" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} disabled={Boolean(editing)} required />
            {!editing ? <input className={input} placeholder="Password" type="password" autoComplete="new-password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /> : null}
            <input className={input} placeholder="Phone" autoComplete="off" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <textarea className={`${input} min-h-20`} placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className={primaryButton}>{editing ? 'Save owner' : 'Create owner'}</button>
              {editing ? <button type="button" className={ghostButton} onClick={() => { setEditing(null); setForm(emptyForm) }}>Cancel</button> : null}
            </div>
          </div>
        </form>
        <div className={tableCard}>
          <div className="hidden grid-cols-[minmax(0,1.4fr)_120px_110px_220px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-500 md:grid">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span></span>
          </div>
          {state.loading ? <LoadingState label="Loading users" /> : null}
          {(state.data?.items || []).map((user) => (
            <div className="grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_120px_110px_220px] md:items-center" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <StatusBadge value={user.role} />
              <StatusBadge value={user.status ? 'active' : 'inactive'} tone={user.status ? 'paid' : 'cancelled'} />
              {user.role !== 'Admin' ? (
                <div className="flex flex-wrap gap-2">
                  {user.role === 'BusinessOwner' ? <button type="button" className={ghostButton} onClick={() => edit(user)}>Edit</button> : null}
                  <button
                    type="button"
                    className={user.status ? dangerButton : `${ghostButton} cursor-not-allowed opacity-60`}
                    onClick={() => removeUser(user)}
                    disabled={!user.status}
                  >
                    {user.status ? 'Remove' : 'Removed'}
                  </button>
                </div>
              ) : <span className="text-sm font-bold text-slate-400">Protected</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


