import Button from 'components/Button'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import { useSessionSetState, useSessionValue } from 'hooks/session'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import type { FC } from 'react'

const CloudSyncSettings = dynamic(
  () => import('components/CloudSyncSettings'),
  { ssr: false }
)

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
      <div className="py-24">
        <CloudSyncSettings />
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
