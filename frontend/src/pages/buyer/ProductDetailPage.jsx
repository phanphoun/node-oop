import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, formatDate, getInitials, getProductImage, ROLES } from '../../utils/constants'
import { card, h1, h2, input, page, primaryButton } from '../../utils/styles'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState('')

  const productState = useAsync(useCallback(() => api.get(`/products/${id}`), [id]), [id])
  const reviewState = useAsync(useCallback(() => api.get(`/reviews/${id}`), [id]), [id])

  const product = productState.data
  const image = getProductImage(product)

  const addToCart = async () => {
    await api.post('/cart', { productId: id, quantity: Number(quantity) })
    setNotice('Added to cart.')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    await api.post('/reviews', { productId: id, rating: Number(rating), comment })
    setComment('')
    setNotice('Review submitted.')
    reviewState.execute().catch(() => {})
  }

  if (productState.loading) return <LoadingState label="Loading product" />

  return (
    <section className={page}>
      <PageHeader eyebrow="Product" title={product?.name || 'Product detail'} description="Review product details, stock availability, and customer feedback." />
      <ErrorMessage message={productState.error || reviewState.error || notice} />
      {product ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-teal-50 to-slate-200">
            {image ? (
              <img className="h-full w-full object-cover" src={image} alt={product.name} />
            ) : (
              <span className="grid h-28 w-28 place-items-center rounded-3xl border border-teal-100 bg-white/80 text-4xl font-black text-teal-800 shadow-sm" aria-hidden="true">
                {getInitials(product.name)}
              </span>
            )}
          </div>
          <div className={`${card} grid content-start gap-4 p-6`}>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-teal-700">{product.category?.name || 'Product'}</p>
            <h1 className={h1}>{product.name}</h1>
            <p className="text-slate-600">{product.description || 'No description available.'}</p>
            <div className="text-3xl font-black text-slate-950">{formatCurrency(product.price)}</div>
            <p className="font-semibold text-slate-500">{product.stock ?? 0} available</p>
            {user?.role === ROLES.buyer ? (
              <div className="flex items-center gap-3">
                <input
                  className={`${input} w-24`}
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  aria-label="Quantity"
                />
                <button type="button" className={primaryButton} onClick={addToCart}>
                  Add to cart
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={`${card} mt-6 p-6`}>
        <h2 className={h2}>Reviews</h2>
        {user?.role === ROLES.buyer ? (
          <form className="my-4 grid gap-3" onSubmit={submitReview}>
            <select className={input} value={rating} onChange={(event) => setRating(event.target.value)}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
            <textarea
              className={input}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your experience"
            />
            <button type="submit" className={primaryButton}>
              Submit review
            </button>
          </form>
        ) : null}
        <div className="grid gap-3">
          {(reviewState.data?.items || []).map((review) => (
            <article key={review.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <div>
                <strong>{review.rating} stars</strong>
                <p className="text-slate-600">{review.comment || 'No comment'}</p>
              </div>
              <span className="text-sm text-slate-500">{formatDate(review.createdAt)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

