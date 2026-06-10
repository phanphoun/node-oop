import { useCallback } from 'react'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency } from '../../utils/constants'
import { dangerButton, page, tableCard } from '../../utils/styles'

export default function AdminProductsPage() {
  const state = useAsync(useCallback(() => api.get('/admin/products'), []), [])
  const remove = async (id) => {
    await api.delete(`/admin/products/${id}`)
    state.execute().catch(() => {})
  }

  return (
    <section className={page}>
      <PageHeader eyebrow="Admin" title="Products" description="Moderate marketplace inventory across all sellers." />
      <ErrorMessage message={state.error} />
      {state.loading ? <LoadingState label="Loading products" /> : null}
      <div className={tableCard}>
        <div className="hidden grid-cols-[minmax(0,1.4fr)_110px_150px_100px_96px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-500 md:grid">
          <span>Product</span>
          <span>Price</span>
          <span>Seller</span>
          <span>Status</span>
          <span></span>
        </div>
        {(state.data?.items || []).map((product) => (
          <div className="grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_110px_150px_100px_96px] md:items-center" key={product.id}>
            <div><strong>{product.name}</strong><p className="text-sm text-slate-500">{product.category?.name || 'Uncategorized'}</p></div>
            <div><p className="text-xs font-bold text-slate-500 md:hidden">Price</p><strong>{formatCurrency(product.price)}</strong></div>
            <div className="truncate"><p className="text-xs font-bold text-slate-500 md:hidden">Seller</p><span>{product.seller?.name || product.sellerId || 'No seller'}</span></div>
            <StatusBadge value={product.status ? 'active' : 'inactive'} tone={product.status ? 'paid' : 'cancelled'} />
            <button type="button" className={dangerButton} onClick={() => remove(product.id)}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  )
}


