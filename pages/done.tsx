import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import { useSessionValue } from 'hooks/session'

const title = 'Completed Todos'

const CurrentSession = () => {
  const session = useSessionValue()

  return <h1 className="text-gray-900">The session provider is {session}.</h1>
}

export default () => (
  <>
    <HeadTitle>{title}</HeadTitle>
    <AppLayout title={title}>
      <GetStartedBroadcast />
      <MoreContainer>
        <CurrentSession />
      </MoreContainer>
    </AppLayout>
  </>
)
