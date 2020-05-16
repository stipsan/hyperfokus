import Button from 'components/Button'
import HeadTitle from 'components/HeadTitle'
import { useSessionSetState, useSessionValue } from 'components/SessionProvider'
import Link from 'next/link'

const title = 'Setup'

const EnableLocalStorage = () => {
  const session = useSessionValue()
  const setSession = useSessionSetState()

  return (
    <Button
      onClick={() => setSession('localstorage')}
      variant={session === 'localstorage' ? 'primary' : 'default'}
    >
      {session === 'localstorage' ? 'Using local storage' : 'Use local storage'}
    </Button>
  )
}
const EnableFirebase = () => {
  const session = useSessionValue()
  const setSession = useSessionSetState()

  return (
    <Button
      onClick={() => setSession('firebase')}
      variant={session === 'firebase' ? 'primary' : 'default'}
    >
      {session === 'firebase' ? 'Using firebase' : 'Use firebase'}
    </Button>
  )
}

export default () => {
  const session = useSessionValue()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <main>
        <h1 className="text-gray-900">The session provider is {session}.</h1>
        <Link href="/">
          <a>Go back</a>
        </Link>
        <br />
        <EnableLocalStorage />
        <br />
        <EnableFirebase />
      </main>
    </>
  )
}
