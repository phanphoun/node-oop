import { useCallback, useState } from 'react'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import { useAsync } from '../../hooks/useAsync'
import { formatDate } from '../../utils/constants'
import { card, formGrid, h2, input, managementLayout, page, primaryButton } from '../../utils/styles'

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ title: '', message: '', type: 'admin_alert', userId: '' })
  const [notice, setNotice] = useState('')
  const state = useAsync(useCallback(() => api.get('/admin/notifications'), []), [])

  const submit = async (event) => {
    event.preventDefault()
    setNotice('')
    try {
      await api.post('/notifications', { ...form, userId: form.userId || null })
      setForm({ title: '', message: '', type: 'admin_alert', userId: '' })
      state.execute().catch(() => {})
    } catch (err) {
      setNotice(err.message)
    }
  }

  return (
    <section className={page}>
      <PageHeader
        eyebrow="Admin"
        title="Notifications"
        description="Create targeted or broadcast messages and review recent sends."
      />
      <ErrorMessage message={state.error || notice} />
      <div className={managementLayout}>
        <form className={formGrid} onSubmit={submit}>
          <h2 className={`${h2} sm:col-span-2`}>Create notification</h2>
          <input className={input} placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <input className={input} placeholder="Type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} />
          <input className={`${input} sm:col-span-2`} placeholder="User ID optional" value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} />
          <textarea className={`${input} sm:col-span-2`} placeholder="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
          <button type="submit" className={primaryButton}>Send notification</button>
        </form>
        <div className="grid gap-3">
          {state.loading ? <LoadingState label="Loading notifications" /> : null}
          {(state.data || []).map((notification) => (
            <article className={`${card} p-4`} key={notification.id}>
              <strong>{notification.title}</strong>
              <p className="mt-1 text-slate-600">{notification.message}</p>
              <small className="mt-2 block text-slate-500">
                {notification.userId || 'Broadcast'} - {formatDate(notification.createdAt)}
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
