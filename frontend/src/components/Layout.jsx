import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../utils/constants'
import { ghostButton, primaryButton } from '../utils/styles'

const buyerLinks = [
  ['/', 'Shop'],
  ['/favorites', 'Favorites'],
  ['/cart', 'Cart'],
  ['/orders', 'Orders'],
  ['/notifications', 'Notifications'],
]

const sellerLinks = [
  ['/seller', 'Seller'],
  ['/seller/products', 'Products'],
  ['/seller/orders', 'Orders'],
  ['/seller/payments', 'Payments'],
]

const adminLinks = [
  ['/admin', 'Admin'],
  ['/admin/users', 'Users'],
  ['/admin/products', 'Products'],
  ['/admin/orders', 'Orders'],
]

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const roleLinks =
    user?.role === ROLES.admin ? adminLinks : user?.role === ROLES.seller ? sellerLinks : buyerLinks

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ecfeff,transparent_32rem),linear-gradient(#f8fafc,#f1f5f9)] text-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
        <Link className="flex items-center gap-3 text-xl font-black text-slate-950 no-underline" to="/">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-700 text-white shadow-sm">B</span>
          <span className="tracking-tight">BuyNow</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-50 p-1 lg:w-fit" aria-label="Primary navigation">
          {roleLinks.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold no-underline transition ${
                  isActive ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-950'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {isAuthenticated ? (
            <>
              <NavLink className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 no-underline hover:bg-slate-100 hover:text-slate-950" to="/profile">
                {user.name}
              </NavLink>
              <button type="button" className={ghostButton} onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink className={ghostButton} to="/login">
                Login
              </NavLink>
              <NavLink className={primaryButton} to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>
        </div>
      </header>
      <main className="pb-10">
        <Outlet />
      </main>
    </div>
  )
}

