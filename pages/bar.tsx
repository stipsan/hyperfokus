import Link from 'next/link'
import { useAuthState } from '../components/Auth'

export default () => {
  const authState = useAuthState()

  return (
    <>
      The auth provider is {authState.provider}.<br />
      <Link href="/foo">Go to foo</Link>
    </>
  )
}
