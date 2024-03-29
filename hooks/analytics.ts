import { useCallback } from 'react'
import { useAnalytics as useFirebaseAnalytics } from 'reactfire'

export const useAnalytics = () => {
  // Suspend on the server only as we're reading the provider initial state from localStorage
  // which is a sync operation, thus we don't need to suspend on it in the client
  if (typeof window === 'undefined') {
    throw new Promise((resolve) => setTimeout(() => resolve(void 0)))
  }

  return useFirebaseAnalytics()
}

export const useLogException = () => {
  const analytics = useAnalytics()

  return useCallback((error: Error, errorInfo?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
    analytics.logEvent('exception', {
      fatal: true,
      description: error.toString(),
      error,
      errorInfo,
    })
    // If errorInfo is provided, we'll assume it's coming from an ErrorBoundary
    if (!errorInfo) {
      alert(error)
    }
  }, [analytics])
}
