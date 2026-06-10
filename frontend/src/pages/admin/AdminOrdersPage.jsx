import { useCallback } from 'react'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, formatDate, shortId } from '../../utils/constants'
import { page, tableCard } from '../../utils/styles'

export default function AdminOrdersPage() {
  const state = useAsync(useCallback(() => api.get('/admin/orders'), []), [])
  return (
    <section className={page}>
      <PageHeader eyebrow="Admin" title="Orders" description="Review buyer orders and fulfillment/payment states." />
      <ErrorMessage message={state.error} />
      {state.loading ? <LoadingState label="Loading orders" /> : null}
      <div className={tableCard}>
        <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(140px,0.8fr)_100px_110px_110px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-500 md:grid">
          <span>Order</span>
          <span>Buyer</span>
          <span>Total</span>
          <span>Order</span>
          <span>Payment</span>
          <span>Date</span>
        </div>
        {(state.data?.items || []).map((order) => (
          <div className="grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_minmax(140px,0.8fr)_100px_110px_110px_120px] md:items-center" key={order.id}>
            <div title={order.id}><p className="text-xs font-bold text-slate-500">Order</p><strong>{shortId(order.id)}</strong></div>
            <div><p className="text-xs font-bold text-slate-500">Buyer</p><span>{order.buyer?.name || order.buyerId}</span></div>
            <div><p className="text-xs font-bold text-slate-500">Total</p><strong>{formatCurrency(order.totalAmount)}</strong></div>
            <StatusBadge value={order.orderStatus} />
            <StatusBadge value={order.paymentStatus} />
            <span>{formatDate(order.createdAt)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}


