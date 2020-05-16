import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'

const title = 'Schedules'

export default () => (
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
