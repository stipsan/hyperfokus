import { createContext, useReducer, useContext } from 'react'
import type { Dispatch } from 'react'

type AuthActions = { type: 'LOGIN' } | { type: 'LOGOUT' }

type AuthState = {
  provider: 'demo' | 'localstorage' | 'firebase'
  readyState: 'init' | 'failure' | 'ready'
}

/**
 * The flow:
 *   1. Demo provider by default.
 *   2. Check if a provider is set in local storage.
 *   3. If so, set it according to the discovered value
 */

const initialState: AuthState = { provider: 'demo', readyState: 'init' }

const AuthStateContext = createContext(initialState)

const AuthDispatchContext = createContext<Dispatch<AuthActions>>(() => {})

const reducer = (state: AuthState, action: AuthActions): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, provider: 'localstorage' }
    case 'LOGOUT':
      return { ...state, provider: 'demo' }
    default:
      // @ts-expect-error
      throw new Error(`Unknown action: ${action.type}`)
  }
}

function test() {
  const foo = new Promise((resolve) => setTimeout(() => resolve(123), 1000))
  if (true) {
    throw foo
  }
}

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const foo = test()

  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthStateContext.Provider value={state}>
        <>
          {children}
          <footer>Test: {foo}</footer>
        </>
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  )
}

export const useAuthState = () => useContext(AuthStateContext)
export const useAuthDispatch = () => useContext(AuthDispatchContext)
