import Link from 'next/link'
import { useAuthState } from '../components/Auth'

export default () => {
  const authState = useAuthState()

  return (
    <>
      <h1 className="text-gray-900">
        The auth provider is {authState.provider}.
      </h1>
      <Link href="/foo">Go to foo</Link>
    </>
  )
}
