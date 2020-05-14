import Link from 'next/link'
import { useAuthState, useAuthDispatch } from 'components/Auth'
import Head from 'next/head'

export default () => {
  const authState = useAuthState()
  const authDispatch = useAuthDispatch()

  return (
    <>
      <Head>
        <title>Foo page</title>
      </Head>
      <h1 className="text-gray-600">
        The auth provider is {authState.provider}.<br />
      </h1>
      {authState.provider === 'demo' && (
        <button
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          onClick={() => authDispatch({ type: 'LOGIN' })}
        >
          Login
        </button>
      )}
      {authState.provider === 'localstorage' && (
        <button
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          onClick={() => authDispatch({ type: 'LOGOUT' })}
        >
          Logout
        </button>
      )}
      <Link href="/bar">
        <a>Go to bar</a>
      </Link>
    </>
  )
}
