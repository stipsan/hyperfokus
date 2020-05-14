import { useAuthDispatch, useAuthState } from 'components/Auth'
import HeadTitle from 'components/HeadTitle'
import Link from 'next/link'

const title = 'Setup'

export default () => {
  const authState = useAuthState()
  const authDispatch = useAuthDispatch()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <h1 className="text-gray-900">
        The auth provider is {authState.provider}.
      </h1>
      <Link href="/">
        <a>Go back</a>
      </Link>
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
    </>
  )
}
