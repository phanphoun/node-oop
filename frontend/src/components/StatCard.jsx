export default function StatCard({ label, value, detail }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <strong className="mt-2 block text-3xl font-black tracking-tight text-slate-950">{value}</strong>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </article>
  )
}
