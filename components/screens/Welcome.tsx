import HeaderLogo from 'components/HeaderLogo'
import HeadTitle from 'components/HeadTitle'
import { useSessionSetState } from 'components/SessionProvider'

//const title = "Hyperfocus your idle time and get things done"
const title = "Hyperfocus your todos until they're done | HyperFokus"

export default () => {
  const setSession = useSessionSetState()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <HeaderLogo />
      <main className=" text-gray-700">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          Welcome welcome welcome
          <button onClick={() => setSession('demo')}>Start demo</button>
          <button onClick={() => setSession('localstorage')}>
            Get started
          </button>
        </div>
      </main>
    </>
  )
}
