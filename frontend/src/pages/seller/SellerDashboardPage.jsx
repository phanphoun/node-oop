import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency } from '../../utils/constants'
import { metricGrid, page, primaryButton } from '../../utils/styles'

export default function SellerDashboardPage() {
  const products = useAsync(useCallback(() => api.get('/seller/products'), []), [])
  const orders = useAsync(useCallback(() => api.get('/seller/orders'), []), [])
  const payments = useAsync(useCallback(() => api.get('/seller/payments'), []), [])
  const revenue = (payments.data?.items || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  return (
    <section className={page}>
      <PageHeader
        eyebrow="Seller workspace"
        title="Dashboard"
        description="Monitor store activity and jump into product management."
        action={<Link className={primaryButton} to="/seller/products">Manage products</Link>}
      />
      <ErrorMessage message={products.error || orders.error || payments.error} />
      {products.loading || orders.loading || payments.loading ? <LoadingState label="Loading dashboard" /> : null}
      <div className={metricGrid}>
        <StatCard label="Products" value={products.data?.meta?.total || 0} detail="Active and inactive listings" />
        <StatCard label="Orders" value={orders.data?.meta?.total || 0} detail="Orders containing your products" />
        <StatCard label="Payments" value={payments.data?.meta?.total || 0} detail="Payment records" />
        <StatCard label="Revenue" value={formatCurrency(revenue)} detail="Visible seller payments" />
      </div>
    </section>
  )
}

