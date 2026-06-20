import { useCallback, useState } from 'react'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency } from '../../utils/constants'
import {
  dangerButton,
  formGrid,
  ghostButton,
  h2,
  input,
  managementLayout,
  page,
  primaryButton,
  tableCard,

} from '../../utils/styles'

const emptyForm = { name: '', description: '', price: '', stock: '', categoryId: '', image: '', sku: '' }

export default function SellerProductsPage() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [message, setMessage] = useState('')
  const products = useAsync(useCallback(() => api.get('/seller/products'), []), [])
  const categories = useAsync(useCallback(() => api.get('/categories'), []), [])

  const edit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      categoryId: product.categoryId || '',
      image: product.image || '',
      sku: product.sku || '',
    })
  }

  const reset = () => {
    setEditingId('')
    setForm(emptyForm)
  }

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId || null,
      image: form.image || null,
      sku: form.sku || null,
    }
    try {
      if (editingId) {
        await api.put(`/seller/products/${editingId}`, payload)
      } else {
        await api.post('/seller/products', payload)
      }
      reset()
      products.execute().catch(() => {})
    } catch (err) {
      setMessage(err.message)
    }
  }

  const remove = async (id) => {
    await api.delete(`/seller/products/${id}`)
    products.execute().catch(() => {})
  }

  return (
    <section className={page}>
      <PageHeader eyebrow="Seller" title="Products" description="Create listings, adjust inventory, and keep storefront data current." />
      <ErrorMessage message={products.error || categories.error || message} />
      <div className={managementLayout}>
        <form className={formGrid} onSubmit={submit}>
          <h2 className={`${h2} sm:col-span-2`}>{editingId ? 'Edit product' : 'New product'}</h2>
          <input className={input} placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <input className={input} placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
          <input className={input} placeholder="Stock" type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
          <select className={input} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
            <option value="">No category</option>
            {(categories.data || []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <input className={input} placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
          <input className={input} placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
          <textarea className={`${input} sm:col-span-2`} placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className={primaryButton}>{editingId ? 'Save changes' : 'Create product'}</button>
            {editingId ? <button type="button" className={ghostButton} onClick={reset}>Cancel</button> : null}
          </div>
        </form>
        <div className={tableCard}>
          <div className="hidden grid-cols-[minmax(0,1.4fr)_110px_90px_180px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-500 md:grid">
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span></span>
          </div>
          {products.loading ? <LoadingState label="Loading products" /> : null}
          {(products.data?.items || []).map((product) => (
            <div className="grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_110px_90px_180px] md:items-center" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <p className="text-sm text-slate-500">{product.sku || 'No SKU'}</p>
              </div>
              <div><p className="text-xs font-bold text-slate-500 md:hidden">Price</p><strong>{formatCurrency(product.price)}</strong></div>
              <div><p className="text-xs font-bold text-slate-500 md:hidden">Stock</p><span>{product.stock}</span></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={ghostButton} onClick={() => edit(product)}>Edit</button>
                <button type="button" className={dangerButton} onClick={() => remove(product.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


