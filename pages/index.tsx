import { Dialog } from '@reach/dialog'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import { useDatabase } from 'hooks/database'
import { useSessionValue } from 'hooks/session'
import { useRouter } from 'next/router'

const LogDatabaseProvider = () => {
  const database = useDatabase()

  console.log('database useDatabase', database)

  return null
}

const CreateDialog = () => {
  const router = useRouter()
  const close = () => {
    router.push(router.pathname)
  }

  if (!router.query.create) {
    return null
  }

  return (
    <Dialog onDismiss={close} aria-label="Create new todo">
      <p>
        I don’t use <code>isOpen</code>, I just render when I should and not
        when I shouldn’t.
      </p>
      <button onClick={close}>Okay</button>
    </Dialog>
  )
}

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
          <LogDatabaseProvider />
          <p>Schedules selector</p>
          <p>Schedules container</p>
        </main>
      </AppLayout>
      <CreateDialog />
    </>
  )
}
