import Button from 'components/Button'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import { useSessionSetState, useSessionValue } from 'hooks/session'

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
  const session = useSessionValue()
  const setSession = useSessionSetState()

  return session !== '' && <Button onClick={() => setSession('')}>Reset</Button>
}

export default () => {
  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title}>
        <GetStartedBroadcast />
        <MoreContainer>
          <br />
          <EnableDemo />
          <br />
          <ResetButton />
          <br />
          <EnableLocalStorage />
          <br />
          <EnableFirebase />
        </MoreContainer>
      </AppLayout>
    </>
  )
}
