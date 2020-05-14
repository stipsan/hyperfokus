import { useAuthState } from 'components/Auth'
import HeadTitle from 'components/HeadTitle'
import Link from 'next/link'

export default () => {
  const authState = useAuthState()

  return (
    <>
      <HeadTitle>Get started</HeadTitle>
      <h1 className="text-gray-900">
        The auth provider is {authState.provider}.
      </h1>
      <Link href="/foo">
        <a>Go to foo</a>
      </Link>
    </>
  )
}
