import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Schedules from 'components/screens/Schedules'
import Welcome from 'components/screens/Welcome'
import { useSessionValue } from 'hooks/session'

const title = 'Schedules'

export default () => {
  const session = useSessionValue()

  if (session === '') {
    return <Welcome />
  }

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title} createLink="New schedule">
        <GetStartedBroadcast />
        <MainContainer>
          <Schedules key={session} />
        </MainContainer>
      </AppLayout>
    </>
  )
}
