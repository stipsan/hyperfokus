import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout, MainContainer } from 'components/layouts'
import SchedulesProvider from 'components/SchedulesProvider'
import Todos from 'components/screens/Todos'
import Welcome from 'components/screens/Welcome'
import TodosProvider from 'components/TodosProvider'
import { useSessionValue } from 'hooks/session'
import { useEffect } from 'react'

export default () => {
  const session = useSessionValue()

  // Scroll to top fix
  useEffect(() => {
    document.scrollingElement.scrollTop = 0
  }, [])

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
