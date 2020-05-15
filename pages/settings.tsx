import Button from 'components/Button'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import Header from 'components/Header'
import HeadTitle from 'components/HeadTitle'
import { useSessionSetState, useSessionValue } from 'components/SessionProvider'

const title = 'Settings'

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
      <Header title={title} />
      <GetStartedBroadcast />
      <br />
      <EnableDemo />
      <br />
      <ResetButton />
    </>
  )
}
