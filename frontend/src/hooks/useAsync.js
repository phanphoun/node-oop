import { useCallback, useEffect, useState } from 'react'

export function useAsync(asyncFn, dependencies = [], options = {}) {
  void dependencies
  const { immediate = true } = options
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(immediate)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError('')
    try {
      const result = await asyncFn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Something went wrong')
      throw err
    } finally {
      setLoading(false)
    }
  }, [asyncFn])

  useEffect(() => {
    if (immediate) {
      Promise.resolve().then(() => execute().catch(() => {}))
    }
  }, [execute, immediate])

  return { data, error, loading, execute, setData }
}

