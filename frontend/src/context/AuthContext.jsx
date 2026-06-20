import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, authStorage } from '../api/client'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(authStorage.getToken())
  const [loading, setLoading] = useState(Boolean(authStorage.getToken()))

  const refreshProfile = useCallback(async () => {
    const currentToken = authStorage.getToken()
    if (!currentToken) {
      setLoading(false)
      return null
    }

    try {
      const profile = await api.get('/auth/profile')
      setUser(profile)
      setToken(currentToken)
      return profile
    } catch {
      authStorage.clearToken()
      setUser(null)
      setToken(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => refreshProfile())
  }, [refreshProfile])

  const login = async (credentials) => {
    const result = await api.post('/auth/login', credentials, { token: null })
    authStorage.setToken(result.token)
    setToken(result.token)
    setUser(result.user)
    return result
  }

  const register = async (payload) => {
    const result = await api.post('/auth/register', payload, { token: null })
    authStorage.setToken(result.token)
    setToken(result.token)
    setUser(result.user)
    return result
  }

  const logout = async () => {
    try {
      if (authStorage.getToken()) {
        await api.post('/auth/logout', {})
      }
    } catch {
      // Local logout should still complete if the server is unavailable.
    } finally {
      authStorage.clearToken()
      setUser(null)
      setToken(null)
    }
  }

  const updateProfile = async (payload) => {
    const profile = await api.put('/auth/profile', payload)
    setUser(profile)
    return profile
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      register,
      refreshProfile,
      updateProfile,
    }),
    [user, token, loading, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

