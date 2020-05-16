import HeaderLogo from 'components/HeaderLogo'
import HeadTitle from 'components/HeadTitle'
import { useSessionSetState } from 'components/SessionProvider'
import Link from 'next/link'

//const title = "Hyperfocus your idle time and get things done"
const title = "Hyperfocus your todos until they're done | HyperFokus"

export default () => {
  const setSession = useSessionSetState()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <HeaderLogo />
      <main>
        Welcome welcome welcome
        <button onClick={() => setSession('demo')}>Start demo</button>
        <Link href="/setup">
          <a>Get started</a>
        </Link>
      </main>
    </>
  )
}
