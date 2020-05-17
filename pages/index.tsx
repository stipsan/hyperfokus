import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import { useSessionValue } from 'hooks/session'

export default () => {
  const session = useSessionValue()

  if (session === '') {
    return <Welcome />
  }

  return (
    <AppLayout>
      <GetStartedBroadcast />
      <main>
        <p>Schedules selector</p>
        <p>Schedules container</p>
      </main>
    </AppLayout>
  )
}
