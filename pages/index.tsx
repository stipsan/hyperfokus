import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import { useDatabase } from 'hooks/database'
import { useSessionValue } from 'hooks/session'

const LogDatabaseProvider = () => {
  const database = useDatabase()

  console.log('database useDatabase', database)

  return null
}

export default () => {
  const session = useSessionValue()

  if (session === '') {
    return <Welcome />
  }

  return (
    <AppLayout>
      <GetStartedBroadcast />
      <main>
        <LogDatabaseProvider />
        <p>Schedules selector</p>
        <p>Schedules container</p>
      </main>
    </AppLayout>
  )
}
