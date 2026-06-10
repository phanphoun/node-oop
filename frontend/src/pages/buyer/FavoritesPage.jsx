import { useCallback } from 'react'
import { api } from '../../api/client'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import ProductCard from '../../components/ProductCard'
import { useAsync } from '../../hooks/useAsync'
import { page } from '../../utils/styles'

export default function FavoritesPage() {
  const state = useAsync(useCallback(() => api.get('/favorites'), []), [])
  const favorites = state.data || []

  const remove = async (favorite) => {
    await api.delete(`/favorites/${favorite.id}`)
    state.execute().catch(() => {})
  }

  return (
    <section className={page}>
      <PageHeader eyebrow="Buyer" title="Favorites" description="Saved products you may want to compare or purchase later." />
      <ErrorMessage message={state.error} />
      {state.loading ? <LoadingState label="Loading favorites" /> : null}
      {!state.loading && favorites.length === 0 ? <EmptyState title="No saved products" /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {favorites.map((favorite) => (
          <ProductCard
            key={favorite.id}
            product={favorite.product}
            onFavorite={() => remove(favorite)}
          />
        ))}
      </div>
    </section>
  )
}

