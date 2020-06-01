import Button from 'components/Button'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import { useSessionSetState, useSessionValue } from 'hooks/session'
import Router from 'next/router'
import { Component, lazy, Suspense } from 'react'
import type { FC } from 'react'
import firebase from 'utils/firebase'

class ErrorBoundary extends Component<{}, { hasError: boolean }> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    firebase.analytics().logEvent(firebase.analytics.EventName.EXCEPTION, {
      fatal: true,
      description: error.toString(),
      error,
      errorInfo,
    })
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
  return (
    <Card>
      <CardHeader>Cloud Sync (Early Preview)</CardHeader>
      <div className="py-12">
        <ErrorBoundary>
          <Suspense fallback={<p className="text-center">Loading…</p>}>
            <CloudSyncSettings />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Card>
  )
}

const EnableLocalStorage = () => {
  const session = useSessionValue()
  const setSession = useSessionSetState()

  return (
    <Button
      onClick={() => setSession('localstorage')}
      variant={session === 'localstorage' ? 'primary' : 'default'}
    >
      {session === 'localstorage' ? 'Using local storage' : 'Use local storage'}
    </Button>
  )
}
const EnableFirebase = () => {
  const session = useSessionValue()
  const setSession = useSessionSetState()

  return (
    <Button
      onClick={() => setSession('firebase')}
      variant={session === 'firebase' ? 'primary' : 'default'}
    >
      {session === 'firebase' ? 'Using firebase' : 'Use firebase'}
    </Button>
  )
}

const EnableDemo = () => {
  const session = useSessionValue()
  const setSession = useSessionSetState()

  return (
    session !== 'demo' && (
      <Button onClick={() => setSession('demo')} variant={'default'}>
        {'Use demo'}
      </Button>
    )
  )
}

const ResetButton = () => {
  const setSession = useSessionSetState()

  return (
    <Button
      className="my-24 mx-auto block"
      variant="danger"
      onClick={() => {
        Router.push('/')
        firebase.analytics().logEvent('reset')
        setSession('')
      }}
    >
      Reset
    </Button>
  )
}

const LocalDebug = () => (
  <>
    <br />
    <EnableDemo />

    <br />
    <EnableLocalStorage />
    <br />
    <EnableFirebase />
  </>
)

export default () => {
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
              {process.env.NODE_ENV === 'development' && <LocalDebug />}
            </Card>
          </div>
        </MoreContainer>
      </AppLayout>
    </>
  )
}
