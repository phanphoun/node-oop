import { useCallback, useState } from 'react'
import { api } from '../../api/client'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import ProductCard from '../../components/ProductCard'
import ProductFilters from '../../components/ProductFilters'
import { useAuth } from '../../context/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { ROLES } from '../../utils/constants'
import { page } from '../../utils/styles'

export default function CatalogPage() {
  const { user, isAuthenticated } = useAuth()
  const [filters, setFilters] = useState({ search: '', category: '', sort: '' })
  const [notice, setNotice] = useState('')
  const [noticeTone, setNoticeTone] = useState('success')

  const loadProducts = useCallback(() => api.get('/products', filters), [filters])
  const { data, error, loading, execute } = useAsync(loadProducts, [loadProducts])
  const categories = useAsync(() => api.get('/categories'), [], { immediate: true })

  const products = data?.items || []

  const handleSubmit = (event) => {
    event.preventDefault()
    execute().catch(() => {})
  }

  const addToCart = async (productId) => {
    if (!isAuthenticated || user?.role !== ROLES.buyer) {
      setNoticeTone('warning')
      setNotice('Login as a buyer to add products to your cart.')
      return
    }
    await api.post('/cart', { productId, quantity: 1 })
    setNoticeTone('success')
    setNotice('Product added to cart.')
  }

  const saveFavorite = async (productId) => {
    if (!isAuthenticated || user?.role !== ROLES.buyer) {
      setNoticeTone('warning')
      setNotice('Login as a buyer to save favorites.')
      return
    }
    await api.post('/favorites', { productId })
    setNoticeTone('success')
    setNotice('Product saved to favorites.')
  }

  return (
    <section className={page}>
      <PageHeader
        eyebrow="Marketplace"
        title="Shop products"
        description="Browse fresh inventory from BuyNow sellers, save favorites, and build your cart quickly."
      />

      <ProductFilters
        filters={filters}
        categories={categories.data || []}
        onChange={setFilters}
        onSubmit={handleSubmit}
      />
      <ErrorMessage message={error || categories.error} />
      <ErrorMessage message={notice} tone={noticeTone} />

      {loading ? <LoadingState label="Loading products" /> : null}
      {!loading && products.length === 0 ? (
        <EmptyState title="No products found" message="Try changing your search or category filter." />
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            onFavorite={saveFavorite}
          />
        ))}
      </div>
    </section>
  )
}

