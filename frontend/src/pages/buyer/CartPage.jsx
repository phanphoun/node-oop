import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, getProductImage } from '../../utils/constants'
import { card, ghostButton, h2, input, page, primaryButton } from '../../utils/styles'

export default function CartPage() {
  const [message, setMessage] = useState('')
  const cartState = useAsync(useCallback(() => api.get('/cart'), []), [])
  const items = cartState.data?.items || []
  const total = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0)

  const updateQuantity = async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity: Number(quantity) })
    cartState.execute().catch(() => {})
  }

  const removeItem = async (itemId) => {
    await api.delete(`/cart/${itemId}`)
    cartState.execute().catch(() => {})
  }

  const checkout = async () => {
    try {
      const order = await api.post('/orders/checkout', {})
      setMessage(`Order ${order.id} created.`)
      cartState.execute().catch(() => {})
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <section className={page}>
      <PageHeader eyebrow="Buyer" title="Cart" description="Review quantities and confirm the order before checkout." />
      <ErrorMessage message={cartState.error || message} />
      {cartState.loading ? <LoadingState label="Loading cart" /> : null}
      {!cartState.loading && items.length === 0 ? (
        <EmptyState title="Your cart is empty" message="Add products from the catalog to start an order." action={<Link className={primaryButton} to="/">Shop products</Link>} />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="grid gap-3">
          {items.map((item) => (
            <article className={`${card} grid gap-4 p-4 sm:grid-cols-[84px_minmax(0,1fr)_110px_auto] sm:items-center`} key={item.id}>
              <img className="aspect-[4/3] h-full w-full rounded-lg bg-slate-100 object-cover sm:h-20" src={getProductImage(item.product)} alt={item.product?.name} />
              <div>
                <strong>{item.product?.name}</strong>
                <p className="text-slate-600">{formatCurrency(item.product?.price)} each</p>
              </div>
              <label className="grid gap-1 text-xs font-bold text-slate-500">
                Qty
                <input className={input} type="number" min="0" value={item.quantity} onChange={(event) => updateQuantity(item.id, event.target.value)} aria-label="Quantity" />
              </label>
              <button type="button" className={ghostButton} onClick={() => removeItem(item.id)}>Remove</button>
            </article>
          ))}
        </div>
        {items.length ? (
          <aside className={`${card} grid content-start gap-4 p-5 lg:sticky lg:top-24`}>
            <h2 className={h2}>Order summary</h2>
            <div className="flex justify-between gap-4 text-sm text-slate-500"><span>Items</span><strong>{items.length}</strong></div>
            <div className="flex justify-between gap-4"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
            <button type="button" className={primaryButton} onClick={checkout}>Checkout</button>
          </aside>
        ) : null}
      </div>
    </section>
  )
}

