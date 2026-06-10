export default function ErrorMessage({ message, tone = 'error' }) {
  if (!message) return null
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
  }

  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-bold ${tones[tone] || tones.error}`}>
      {message}
    </div>
  )
}

