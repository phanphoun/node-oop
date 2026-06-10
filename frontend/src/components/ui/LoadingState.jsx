export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="grid justify-items-center gap-3 px-6 py-10 text-center text-slate-600" role="status">
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700"
        aria-hidden="true"
      ></span>
      <span>{label}</span>
    </div>
  )
}

