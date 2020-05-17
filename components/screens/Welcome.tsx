import HeaderLogo from 'components/HeaderLogo'
import HeadTitle from 'components/HeadTitle'
import { useSessionSetState } from 'hooks/session'

//const title = "Hyperfocus your idle time and get things done"
const title = "Hyperfocus your todos until they're done | HyperFokus"

export default () => {
  const setSession = useSessionSetState()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <HeaderLogo />
      <main className="text-gray-700">
        <div className="container mx-auto flex px-4 py-24 md:flex-row flex-col items-center">
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0">
            <img
              className="object-cover object-center rounded"
              alt=""
              src="https://dummyimage.com/720x600"
              height="600px"
              width="720px"
              style={{
                filter: 'sepia(1) hue-rotate(180deg) opacity(.9) grayscale(.7)',
              }}
            />
          </div>
          <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              Hyperfocus your idle time
            </h1>
            <p className="mb-8 leading-relaxed">
              Accomplish more by no longer worrying about interruptions or
              changes to your schedule. HyperFokus' daily forecast shows you
              what's achievable today; not a growing list with overdue tasks you
              failed to do yesterday.
            </p>
            <div className="flex justify-center">
              <button
                className="inline-flex font-bold text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none focus:shadow-outline hover:bg-blue-600 rounded text-lg"
                onClick={() => setSession('demo')}
              >
                Try demo
              </button>
              <button
                className="ml-4 inline-flex text-gray-700 bg-gray-200 border-0 py-2 px-6 focus:outline-none focus:shadow-outline hover:bg-gray-300 rounded text-lg"
                onClick={() => setSession('localstorage')}
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
