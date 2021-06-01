import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout, MainContainer } from 'components/layouts'
import Todos from 'components/lazy/todos'
import Welcome from 'components/screens/intro'
import { useSessionValue } from 'hooks/session'

export default function IndexPage() {
  const session = useSessionValue()

  if (session === '') {
    return <Welcome />
  }

  return (
    <>
      <AppLayout createLink="New todo">
        <GetStartedBroadcast />
        <MainContainer>
          <Todos />
        </MainContainer>
      </AppLayout>
    </>
  )
}
