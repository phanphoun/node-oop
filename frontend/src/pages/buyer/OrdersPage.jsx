import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, formatDate, shortId } from '../../utils/constants'
import { page } from '../../utils/styles'

export default function OrdersPage() {
  const state = useAsync(useCallback(() => api.get('/orders'), []), [])
  const orders = state.data?.items || []

  return (
    <section className={page}>
      <PageHeader eyebrow="Buyer" title="Orders" description="Track recent purchases, payment state, and fulfillment progress." />
      <ErrorMessage message={state.error} />
      {state.loading ? <LoadingState label="Loading orders" /> : null}
      {!state.loading && orders.length === 0 ? <EmptyState title="No orders yet" /> : null}
      <div className="grid gap-3">
        {orders.map((order) => (
          <Link
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 no-underline shadow-sm transition hover:border-teal-200 hover:shadow-md md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center"
            key={order.id}
            to={`/orders/${order.id}`}
            title={order.id}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Order</p>
              <strong className="text-slate-950">{shortId(order.id)}</strong>
            </div>
            <div className="md:text-right">
              <p className="text-xs font-bold text-slate-500">Total</p>
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={order.orderStatus} />
              <StatusBadge value={order.paymentStatus} />
            </div>
            <span className="text-sm font-semibold text-slate-500">{formatDate(order.createdAt)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

