import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import { useSessionValue } from 'components/SessionProvider'

const title = 'Schedules'

export default () => {
  const session = useSessionValue()

  if (session === '') {
    return <Welcome />
  }

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title}>
        <GetStartedBroadcast />
        <MainContainer>
          <p>List over schedules</p>
        </MainContainer>
      </AppLayout>
    </>
  )
}
