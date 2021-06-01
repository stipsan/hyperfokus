// Loaded to initiate automatic analytics and performance metrics
import { useAnalytics } from 'hooks/analytics'
import { useObserveSession, useSessionValue } from 'hooks/session'
import { memo, useEffect } from 'react'

// @TODO extract more into dynamically imported components to see if it can improve First Load JS stats

const SessionObserver = memo(() => {
  // Ensures the current database provider is broadcast to other tabs, ensuring they're in sync
  useObserveSession()

  // Keeps analytics in sync with the session in use
  const session = useSessionValue()
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.setUserProperties({ session })
  }, [analytics, session])

  return null
})
export default SessionObserver
