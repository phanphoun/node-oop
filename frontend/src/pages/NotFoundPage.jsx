import { Link } from 'react-router-dom'
import { narrowPage, primaryButton } from '../utils/styles'

export default function NotFoundPage() {
  return (
    <section className={narrowPage}>
      <div className="grid justify-items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h1 className="text-3xl font-black text-slate-950">Page not found</h1>
        <p className="text-slate-600">The page you are looking for does not exist.</p>
        <Link className={primaryButton} to="/">Back to shop</Link>
      </div>
    </section>
  )
}

