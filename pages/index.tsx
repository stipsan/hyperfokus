import { Dialog } from '@reach/dialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import UnderConstruction from 'components/UnderConstruction'
import { useDatabase } from 'hooks/database'
import { useSessionValue } from 'hooks/session'
import { useRouter } from 'next/router'
import { memo } from 'react'

const LogDatabaseProvider = memo(() => {
  const database = useDatabase()

  if (process.env.NODE_ENV === 'development') {
    console.log('database useDatabase', database)
  }

  return null
})

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
      <p className="py-16">The ability to create todos is on its way!</p>
      <DialogToolbar
        right={
          <Button variant="primary" onClick={close}>
            Okay
          </Button>
        }
      />
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
          <UnderConstruction />
        </main>
      </AppLayout>
      <CreateDialog />
    </>
  )
}
