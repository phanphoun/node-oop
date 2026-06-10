export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      {message ? <p className="max-w-md text-slate-600">{message}</p> : null}
      {action}
    </div>
  )
}

