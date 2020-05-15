import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout } from 'components/layouts'

const title = 'Schedules'

export default () => (
  <>
    <HeadTitle>{title}</HeadTitle>
    <AppLayout>
      <GetStartedBroadcast />
    </AppLayout>
  </>
)
