import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout } from 'components/layouts'
import Todos from 'components/screens/Todos'
import Welcome from 'components/screens/Welcome'
import { useSessionValue } from 'hooks/session'

export default () => {
  const session = useSessionValue()

  if (session === '') {
    return <Welcome />
  }

  return (
    <>
      <AppLayout createLink="New todo">
        <GetStartedBroadcast />
        <main>
          <Todos key={session} />
        </main>
      </AppLayout>
    </>
  )
}
