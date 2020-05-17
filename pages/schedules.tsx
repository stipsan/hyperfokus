import { Dialog } from '@reach/dialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import { useSessionValue } from 'hooks/session'
import { useRouter } from 'next/router'

const title = 'Schedules'

const CreateDialog = () => {
  const router = useRouter()
  const close = () => {
    router.push(router.pathname)
  }

  if (!router.query.create) {
    return null
  }

  return (
    <Dialog onDismiss={close} aria-label="Create new schedule">
      <p className="py-16">The ability to create schedules is coming soon!</p>
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
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title} createLink="New schedule">
        <GetStartedBroadcast />
        <MainContainer>
          <p>List over schedules</p>
        </MainContainer>
      </AppLayout>
      <CreateDialog />
    </>
  )
}
