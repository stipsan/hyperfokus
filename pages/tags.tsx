import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import TagsProvider from 'components/TagsProvider'
import Tags from 'components/screens/Tags/LazyTags'
import Welcome from 'components/screens/welcomeS'
import { useSessionValue } from 'hooks/session'

const title = 'Tags'

export default function TagsPage() {
  const session = useSessionValue()

  if (session === '') {
    return <Welcome />
  }

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title} createLink="New tag">
        <GetStartedBroadcast />
        <MainContainer>
          <TagsProvider>
            <Tags />
          </TagsProvider>
        </MainContainer>
      </AppLayout>
    </>
  )
}
