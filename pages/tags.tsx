import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Tags from 'components/lazy/tags'
import Intro from 'components/screens/intro'
import { useSessionValue } from 'hooks/session'

const title = 'Tags'

export default function TagsPage() {
  const session = useSessionValue()

  if (session === '') {
    return <Intro />
  }

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title} createLink="New tag">
        <GetStartedBroadcast />
        <MainContainer>
          <Tags />
        </MainContainer>
      </AppLayout>
    </>
  )
}
