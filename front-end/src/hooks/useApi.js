import { useCallback, useEffect, useState } from 'react'

/**
 * Load data from the api when a page opens, with loading and error states handled for you.
 *
 * @param {Function} load  a function that returns a promise, e.g. () => api.getApplication(id)
 * @param {Array} deps     values that should trigger a reload when they change, e.g. [id]
 *
 * @example
 * const { data: application, loading, error, reload } = useApi(() => api.getApplication(id), [id])
 * if (loading) return <LoadingState />
 * if (error) return <ErrorState message={error.message} onRetry={reload} />
 */
export function useApi(load, deps = []) {
  const [reloadCount, setReloadCount] = useState(0)
  // Identifies the current request; when it changes (new deps or reload), we fetch again.
  const requestKey = JSON.stringify([...deps, reloadCount])
  const [result, setResult] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    let cancelled = false
    load()
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: requestKey, data: null, error })
      })
    return () => {
      cancelled = true
    }
    // `load` is a new function on every render, so we rely on `deps` (through requestKey) instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  // Lets a page update what's on screen right after a save, without reloading.
  const setData = useCallback((value) => {
    setResult((current) => ({ ...current, data: typeof value === 'function' ? value(current.data) : value }))
  }, [])

  return {
    data: result.data, // stays on screen while reloading, so the page doesn't flash empty
    loading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    reload,
    setData,
  }
}
