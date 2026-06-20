import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, getProductImage, shortId } from '../../utils/constants'
import { card, h2, page, primaryButton } from '../../utils/styles'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [message, setMessage] = useState('')
  const state = useAsync(useCallback(() => api.get(`/orders/${id}`), [id]), [id])
  const order = state.data

  const pay = async () => {
    try {
      await api.post('/payments/paypal', { orderId: id })
      setMessage('Payment request created.')
      state.execute().catch(() => {})
    } catch (err) {
      setMessage(err.message)
    }
  }

  if (state.loading) return <LoadingState label="Loading order" />

  return (
    <section className={page}>
      <ErrorMessage message={state.error || message} />
      {order ? (
        <>
          <PageHeader
            eyebrow="Order detail"
            title={shortId(order.id)}
            description={`Placed ${order.createdAt ? `on ${new Date(order.createdAt).toLocaleDateString()}` : ''}`}
            meta={<p className="text-xs text-slate-500" title={order.id}>Full ID: {order.id}</p>}
            action={
              <>
              <StatusBadge value={order.orderStatus} />
              <StatusBadge value={order.paymentStatus} />
              </>
            }
          />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <div className="grid gap-3">
              {(order.items || []).map((item) => (
                <article className={`${card} grid gap-4 p-4 sm:grid-cols-[84px_minmax(0,1fr)] sm:items-center`} key={item.id}>
                  <img className="aspect-[4/3] h-full w-full rounded-lg bg-slate-100 object-cover sm:h-20" src={getProductImage(item.product)} alt={item.product?.name} />
                  <div>
                    <strong>{item.product?.name}</strong>
                    <p className="text-slate-600">{item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                </article>
              ))}
            </div>
            <aside className={`${card} grid content-start gap-4 p-5`}>
              <h2 className={h2}>Total</h2>
              <div className="text-3xl font-black text-slate-950">{formatCurrency(order.totalAmount)}</div>
              {order.paymentStatus !== 'paid' ? (
                <button type="button" className={primaryButton} onClick={pay}>Pay with PayPal</button>
              ) : null}
            </aside>
          </div>
        </>
      ) : null}
    </section>
  )
}

