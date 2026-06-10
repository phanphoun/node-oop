import { useCallback } from 'react'
import { api } from '../api/client'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { formatDate } from '../utils/constants'
import { card, ghostButton, narrowPage } from '../utils/styles'

export default function NotificationsPage() {
  const state = useAsync(useCallback(() => api.get('/notifications'), []), [])
  const notifications = state.data || []

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`, {})
    state.execute().catch(() => {})
  }

  return (
    <section className={narrowPage}>
      <PageHeader eyebrow="Updates" title="Notifications" description="Order updates, account messages, and seller announcements." />
      <ErrorMessage message={state.error} />
      {state.loading ? <LoadingState label="Loading notifications" /> : null}
      {!state.loading && notifications.length === 0 ? <EmptyState title="No notifications" /> : null}
      <div className="grid gap-3">
        {notifications.map((notification) => (
          <article
            className={`${card} flex items-start justify-between gap-4 p-4 ${
              notification.isRead ? '' : 'border-teal-200 bg-teal-50'
            }`}
            key={notification.id}
          >
            <div>
              <strong>{notification.title}</strong>
              <p className="text-slate-600">{notification.message}</p>
              <small className="text-slate-500">{formatDate(notification.createdAt)}</small>
            </div>
            {!notification.isRead ? (
              <button type="button" className={ghostButton} onClick={() => markRead(notification.id)}>Mark read</button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

