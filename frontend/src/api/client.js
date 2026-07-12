const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const TOKEN_KEY = 'buynow_token'

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
}

const buildUrl = (path, query) => {
  // window.location.origin as base keeps this valid for BOTH absolute
  // bases (http://host/api) and relative bases (/api) — a relative URL
  // with no base throws "Failed to construct 'URL': Invalid URL".
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }
  return url.toString()
}

export async function apiRequest(path, options = {}) {
  const { query, body, token = authStorage.getToken(), auth = true, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers || {})

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  let payload = null
  if (isJson) {
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const message = (payload && typeof payload === 'object' && payload.message)
      ? payload.message
      : `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  if (payload && typeof payload === 'object' && payload.success === false) {
    const error = new Error(payload.message || 'Request failed')
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload?.data ?? payload
}

export const api = {
  get: (path, query, options) => apiRequest(path, { ...options, method: 'GET', query }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
}

