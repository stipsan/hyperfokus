import Button from 'components/Button'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import { useAnalytics, useLogException } from 'hooks/analytics'
import { useSessionSetState } from 'hooks/session'
import Router from 'next/router'
import { Component, lazy, Suspense } from 'react'
import type { FC } from 'react'

class ErrorBoundary extends Component<{
  logException: (error: Error, errorInfo?: unknown) => void
}> {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.props.logException(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}

const CloudSyncSettings = lazy(() => import('components/CloudSyncSettings'))

const title = 'Settings'

const Card: FC = ({ children }) => (
  <section className="shadow-md py-4 px-6 my-16 rounded-lg">{children}</section>
)
const CardHeader: FC = ({ children }) => (
  <h2 className="mb-4 font-bold text-xl">{children}</h2>
)

const CloudSyncCard = () => {
  const logException = useLogException()
  return (
    <Card>
      <CardHeader>Cloud Sync (Early Preview)</CardHeader>
      <div className="py-12">
        <ErrorBoundary logException={logException}>
          <Suspense fallback={<p className="text-center">Loading…</p>}>
            <CloudSyncSettings />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Card>
  )
}

const ResetButton = () => {
  const setSession = useSessionSetState()
  const analytics = useAnalytics()

  return (
    <Button
      className="my-24 mx-auto block"
      variant="danger"
      onClick={() => {
        Router.push('/')
        analytics.logEvent('reset')
        setSession('')
      }}
    >
      Reset
    </Button>
  )
}

export default function SettingsPage() {
  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title}>
        <MoreContainer>
          <div className="px-inset container">
            <Card>
              <CardHeader>Appearance</CardHeader>
              <p className="block mx-auto my-24 text-center">
                Under construction…
              </p>
            </Card>
            <CloudSyncCard />
            <Card>
              <CardHeader>Advanced</CardHeader>
              <ResetButton />
            </Card>
          </div>
        </MoreContainer>
      </AppLayout>
    </>
  )
}
