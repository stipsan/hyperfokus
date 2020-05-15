import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout } from 'components/layouts'
import { useSessionValue } from 'components/SessionProvider'

const title = 'Completed Activities'

const CurrentSession = () => {
  const session = useSessionValue()

  return <h1 className="text-gray-900">The session provider is {session}.</h1>
}

export default () => (
  <>
    <HeadTitle>{title}</HeadTitle>
    <AppLayout>
      <GetStartedBroadcast />
      <CurrentSession />
    </AppLayout>
  </>
)
