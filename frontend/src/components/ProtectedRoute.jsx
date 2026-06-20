import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LoadingState from './ui/LoadingState'

export default function ProtectedRoute({ roles }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState label="Checking your session" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

