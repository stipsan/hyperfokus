import { useAuthState } from 'components/Auth'
import HeadTitle from 'components/HeadTitle'
import Link from 'next/link'

const title = 'Setup'

export default () => {
  const authState = useAuthState()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <h1 className="text-gray-900">
        The auth provider is {authState.provider}.
      </h1>
      <Link href="/">
        <a>Go back</a>
      </Link>
    </>
  )
}
