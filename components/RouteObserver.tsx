import { useAnalytics } from 'hooks/analytics'
import Router from 'next/router'
import { memo, useEffect } from 'react'

const RouteObserver = memo(() => {
  const analytics = useAnalytics()
  useEffect(() => {
    const handleRouteChange = (url) => {
      analytics.logEvent('page_view', { page_path: url })
    }
    Router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return null
})

export default RouteObserver
