import { moreLinks } from 'components/Header'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MoreContainer } from 'components/layouts'
import Link from 'next/link'

const title = 'More'

export default () => (
  <>
    <HeadTitle>{title}</HeadTitle>
    <AppLayout title={title}>
      <MoreContainer>
        <nav className="flex flex-wrap lg:w-4/5 sm:mx-auto sm:mb-2 my-16">
          {moreLinks.map(([text, href]) => (
            <div key={href} className="p-2 sm:w-1/2 w-full">
              <Link href={href}>
                <a className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded flex p-4 h-full items-center focus:outline-none focus:shadow-outline">
                  {text}
                </a>
              </Link>
            </div>
          ))}
        </nav>
      </MoreContainer>
    </AppLayout>
  </>
)
