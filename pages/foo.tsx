import Link from 'next/link'
import { useAuthState, useAuthDispatch } from '../components/Auth'

export default () => {
  const authState = useAuthState()
  const authDispatch = useAuthDispatch()

  return (
    <>
      The auth provider is {authState.provider}.<br />
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
      <Link href="/bar">Go to bar</Link>
    </>
  )
}
