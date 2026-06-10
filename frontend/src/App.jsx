import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ROLES } from './utils/constants'
import CatalogPage from './pages/buyer/CatalogPage'
import ProductDetailPage from './pages/buyer/ProductDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import CartPage from './pages/buyer/CartPage'
import FavoritesPage from './pages/buyer/FavoritesPage'
import OrdersPage from './pages/buyer/OrdersPage'
import OrderDetailPage from './pages/buyer/OrderDetailPage'
import NotificationsPage from './pages/NotificationsPage'
import SellerDashboardPage from './pages/seller/SellerDashboardPage'
import SellerProductsPage from './pages/seller/SellerProductsPage'
import SellerOrdersPage from './pages/seller/SellerOrdersPage'
import SellerPaymentsPage from './pages/seller/SellerPaymentsPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={[ROLES.buyer]} />}>
              <Route path="cart" element={<CartPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={[ROLES.seller]} />}>
              <Route path="seller" element={<SellerDashboardPage />} />
              <Route path="seller/products" element={<SellerProductsPage />} />
              <Route path="seller/orders" element={<SellerOrdersPage />} />
              <Route path="seller/payments" element={<SellerPaymentsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={[ROLES.admin]} />}>
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/products" element={<AdminProductsPage />} />
              <Route path="admin/orders" element={<AdminOrdersPage />} />
              <Route path="admin/notifications" element={<AdminNotificationsPage />} />
            </Route>

            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

