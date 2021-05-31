import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout, MainContainer } from 'components/layouts'
import SchedulesProvider from 'components/SchedulesProvider'
import Todos from 'components/screens/Todos/LazyTodos'
import Welcome from 'components/screens/welcomeS'
import TodosProvider from 'components/TodosProvider'
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
          <SchedulesProvider>
            <TodosProvider>
              <Todos />
            </TodosProvider>
          </SchedulesProvider>
        </MainContainer>
      </AppLayout>
    </>
  )
}
