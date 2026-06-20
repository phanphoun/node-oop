import { Link } from 'react-router-dom'
import { formatCurrency, getInitials, getProductImage } from '../utils/constants'
import { ghostButton, primaryButton } from '../utils/styles'

export default function ProductCard({ product, onAddToCart, onFavorite }) {
  const image = getProductImage(product)

  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-xl">
      <Link
        to={`/products/${product.id}`}
        className="grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-slate-100 via-teal-50 to-cyan-50 no-underline"
      >
        {image ? (
          <img className="h-full w-full object-cover transition group-hover:scale-[1.03]" src={image} alt={product.name} />
        ) : (
          <span
            className="grid h-20 w-20 place-items-center rounded-2xl border border-teal-100 bg-white/80 text-2xl font-black text-teal-800 shadow-sm"
            aria-hidden="true"
          >
            {getInitials(product.name)}
          </span>
        )}
      </Link>
      <div className="grid flex-1 gap-3 p-4">
        <div>
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-teal-700">
            {product.category?.name || 'Marketplace'}
          </p>
          <Link to={`/products/${product.id}`} className="line-clamp-2 text-lg font-black leading-snug text-slate-950 no-underline hover:text-teal-800">
            {product.name}
          </Link>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
          {product.description || 'No description available.'}
        </p>
        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <strong className="text-lg text-slate-950">{formatCurrency(product.price)}</strong>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {product.stock ?? 0} in stock
          </span>
        </div>
        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
          {onAddToCart ? (
            <button type="button" className={primaryButton} onClick={() => onAddToCart(product.id)}>
              Add to cart
            </button>
          ) : null}
          {onFavorite ? (
            <button type="button" className={ghostButton} onClick={() => onFavorite(product.id)}>
              Save
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

