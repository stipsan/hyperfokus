import Button from 'components/Button'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import { useSessionSetState, useSessionValue } from 'hooks/session'
import Router from 'next/router'

const title = 'Settings'

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
      className="mt-6"
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
          <div className="px-inset">
            <ResetButton />
            {process.env.NODE_ENV === 'development' && <LocalDebug />}
          </div>
        </MoreContainer>
      </AppLayout>
    </>
  )
}
