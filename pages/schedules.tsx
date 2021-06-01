import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Schedules from 'components/lazy/schedules'
import Intro from 'components/screens/intro'
import { useSessionValue } from 'hooks/session'

const title = 'Schedules'

export default function SchedulesPage() {
  const session = useSessionValue()

  if (session === '') {
    return <Intro />
  }

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title} createLink="New schedule">
        <GetStartedBroadcast />
        <MainContainer>
          <Schedules />
        </MainContainer>
      </AppLayout>
    </>
  )
}
