import { useAuthDispatch, useAuthState } from 'components/Auth'
import Header from 'components/Header'
import HeadTitle from 'components/HeadTitle'
import Link from 'next/link'
import { useSession } from 'components/SessionProvider'

const title = 'Help'

export default () => {
  const authState = useAuthState()
  const authDispatch = useAuthDispatch()
  const session = useSession()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <Header title={title} />
      <main className="min-h-50vh flex items-center justify-center">
        Session: {session}
        <a
          className="rounded-lg px-4 md:px-5 xl:px-4 py-3 md:py-4 xl:py-3 bg-gray-500 hover:bg-gray-600 md:text-lg xl:text-base text-white font-semibold leading-tight shadow-md"
          href="mailto:stipsan@gmail.com"
        >
          Get help
        </a>
      </main>
    </>
  )
}
