export const ROLES = {
  admin: 'Admin',
  seller: 'BusinessOwner',
  buyer: 'Buyer',
}

export const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
export const paymentStatuses = ['pending', 'paid', 'failed', 'refunded']

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0))

export const formatDate = (value) => {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export const getProductImage = (product) => product?.image || ''

export const shortId = (value) => {
  if (!value) return 'N/A'
  const text = String(value)
  return text.length > 12 ? `${text.slice(0, 8)}...${text.slice(-4)}` : text
}

export const getInitials = (value = 'BuyNow') =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'B'

