import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import UnderConstruction from 'components/UnderConstruction'

const title = 'Completed Todos'

export default function DonePage() {
  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title}>
        <MoreContainer>
          <UnderConstruction />
        </MoreContainer>
      </AppLayout>
    </>
  )
}
