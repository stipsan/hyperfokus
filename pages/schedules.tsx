import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Schedules from 'components/screens/Schedules'
import Welcome from 'components/screens/Welcome'
import { useSessionValue } from 'hooks/session'
import { useEffect } from 'react'

const title = 'Schedules'

export default () => {
  const session = useSessionValue()

  // Scroll to top fix
  useEffect(() => {
    document.scrollingElement.scrollTop = 0
  }, [])

  if (session === '') {
    return <Welcome />
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
