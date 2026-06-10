import { useCallback } from 'react'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, formatDate, shortId } from '../../utils/constants'
import { page, tableCard } from '../../utils/styles'

export default function SellerPaymentsPage() {
  const state = useAsync(useCallback(() => api.get('/seller/payments'), []), [])
  return (
    <section className={page}>
      <PageHeader eyebrow="Seller" title="Payments" description="Payment records related to your seller orders." />
      <ErrorMessage message={state.error} />
      {state.loading ? <LoadingState label="Loading seller payments" /> : null}
      <div className={tableCard}>
        <div className="hidden grid-cols-[minmax(0,1.2fr)_110px_110px_120px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-500 md:grid">
          <span>Transaction</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Method</span>
          <span>Date</span>
        </div>
        {(state.data?.items || []).map((payment) => (
          <div className="grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_110px_110px_120px_120px] md:items-center" key={payment.id}>
            <div title={payment.transactionId || payment.id}><p className="text-xs font-bold text-slate-500">Transaction</p><strong>{shortId(payment.transactionId || payment.id)}</strong></div>
            <div><p className="text-xs font-bold text-slate-500 md:hidden">Amount</p><strong>{formatCurrency(payment.amount)}</strong></div>
            <StatusBadge value={payment.paymentStatus} />
            <span>{payment.paymentMethod}</span>
            <span>{formatDate(payment.createdAt)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}


