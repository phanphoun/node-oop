import { input, label as labelClass, primaryButton } from '../utils/styles'

export default function ProductFilters({ filters, categories, onChange, onSubmit }) {
  const update = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <form
      className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm lg:grid-cols-[minmax(240px,1.2fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto] lg:items-end"
      onSubmit={onSubmit}
    >
      <label className={labelClass}>
        <span>Search</span>
        <input
          className={input}
          value={filters.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Find products"
        />
      </label>
      <label className={labelClass}>
        <span>Category</span>
        <select className={input} value={filters.category} onChange={(event) => update('category', event.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>Sort</span>
        <select className={input} value={filters.sort} onChange={(event) => update('sort', event.target.value)}>
          <option value="">Newest</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="name">Name</option>
        </select>
      </label>
      <button type="submit" className={primaryButton}>
        Apply
      </button>
    </form>
  )
}

