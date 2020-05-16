import HeadTitle from 'components/HeadTitle'
import { AppLayout } from 'components/layouts'
import { moreLinks } from 'components/Header'
import Link from 'next/link'

const title = 'More'

export default () => (
  <>
    <HeadTitle>{title}</HeadTitle>
    <AppLayout>
      <nav className="grid">
        {moreLinks.map(([text, href]) => (
          <Link key={href} href={href}>
            <a className="">{text}</a>
          </Link>
        ))}
      </nav>
    </AppLayout>
  </>
)
