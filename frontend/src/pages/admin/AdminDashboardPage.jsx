import { useCallback } from 'react'
import { api } from '../../api/client'
import ErrorMessage from '../../components/ui/ErrorMessage'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency } from '../../utils/constants'
import { metricGrid, page } from '../../utils/styles'

export default function AdminDashboardPage() {
  const state = useAsync(useCallback(() => api.get('/admin/analytics'), []), [])
  const analytics = state.data || {}

  return (
    <section className={page}>
      <PageHeader eyebrow="Admin" title="Dashboard" description="Platform health, marketplace activity, and revenue overview." />
      <ErrorMessage message={state.error} />
      {state.loading ? <LoadingState label="Loading analytics" /> : null}
      <div className={metricGrid}>
        <StatCard label="Users" value={analytics.users || 0} />
        <StatCard label="Sellers" value={analytics.sellers || 0} />
        <StatCard label="Buyers" value={analytics.buyers || 0} />
        <StatCard label="Products" value={analytics.products || 0} />
        <StatCard label="Orders" value={analytics.orders || 0} />
        <StatCard label="Payments" value={analytics.payments || 0} />
        <div className="sm:col-span-2">
          <StatCard label="Revenue" value={formatCurrency(analytics.revenue)} detail="Paid payment total" />
        </div>
      </div>
    </section>
  )
}

