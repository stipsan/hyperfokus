import { useAuthDispatch, useAuthState } from 'components/Auth'
import Header from 'components/Header'
import HeadTitle from 'components/HeadTitle'
import Link from 'next/link'

const title = 'Help'

export default () => {
  const authState = useAuthState()
  const authDispatch = useAuthDispatch()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <Header title={title} />
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
    </>
  )
}
