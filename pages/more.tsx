import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { moreLinks } from 'components/Header'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import Link from 'next/link'

const title = 'More'

export default () => (
  <>
    <HeadTitle>{title}</HeadTitle>
    <AppLayout title={title}>
      <GetStartedBroadcast />
      <MoreContainer>
        <nav className="grid">
          {moreLinks.map(([text, href]) => (
            <Link key={href} href={href}>
              <a className="">{text}</a>
            </Link>
          ))}
        </nav>
      </MoreContainer>
    </AppLayout>
  </>
)
