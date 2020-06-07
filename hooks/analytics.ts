import { useAnalytics as useFirebaseAnalytics } from 'reactfire'

export const useAnalytics = () => {
  // Suspend on the server only as we're reading the provider initial state from localStorage
  // which is a sync operation, thus we don't need to suspend on it in the client
  if (typeof window === 'undefined') {
    throw new Promise((resolve) => setTimeout(() => resolve()))
  }

  return useFirebaseAnalytics()
}
