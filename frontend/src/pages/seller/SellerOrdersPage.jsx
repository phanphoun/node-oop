import { useCallback } from 'react'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, formatDate, shortId } from '../../utils/constants'
import { page, tableCard } from '../../utils/styles'

export default function SellerOrdersPage() {
  const state = useAsync(useCallback(() => api.get('/seller/orders'), []), [])
  return (
    <section className={page}>
      <PageHeader eyebrow="Seller" title="Orders" description="Orders that include products from your store." />
      <ErrorMessage message={state.error} />
      {state.loading ? <LoadingState label="Loading seller orders" /> : null}
      <div className={tableCard}>
        <div className="hidden grid-cols-[minmax(0,1.2fr)_110px_110px_110px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-500 md:grid">
          <span>Order</span>
          <span>Total</span>
          <span>Status</span>
          <span>Payment</span>
          <span>Date</span>
        </div>
        {(state.data?.items || []).map((order) => (
          <div className="grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_110px_110px_110px_120px] md:items-center" key={order.id}>
            <div title={order.id}><p className="text-xs font-bold text-slate-500">Order</p><strong>{shortId(order.id)}</strong></div>
            <div><p className="text-xs font-bold text-slate-500 md:hidden">Total</p><strong>{formatCurrency(order.totalAmount)}</strong></div>
            <StatusBadge value={order.orderStatus} />
            <StatusBadge value={order.paymentStatus} />
            <span>{formatDate(order.createdAt)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}


