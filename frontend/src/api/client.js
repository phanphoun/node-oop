const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const TOKEN_KEY = 'buynow_token'

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
}

const buildUrl = (path, query) => {
  const url = new URL(`${API_BASE_URL}${path}`)
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
  const { query, body, token = authStorage.getToken(), ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers || {})

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `Request failed with status ${response.status}`)
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

