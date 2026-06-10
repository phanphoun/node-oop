export default function StatusBadge({ value, tone }) {
  const normalized = String(value || 'unknown').toLowerCase()
  const className = tone || normalized
  const tones = {
    paid: 'bg-emerald-100 text-emerald-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    active: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    shipped: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
    inactive: 'bg-red-100 text-red-700',
  }

  return (
    <span
      className={`inline-flex min-w-20 justify-center rounded-full px-2.5 py-1 text-xs font-black capitalize ${
        tones[className] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {normalized}
    </span>
  )
}

