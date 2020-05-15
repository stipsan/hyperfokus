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

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Suspend on the server only as we're reading the provider state from localStorage
  // which is a sync operation, thus we don't need to suspend on it in the client
  if (typeof window === 'undefined') {
    throw new Promise((resolve) => setTimeout(() => resolve()))
  }

  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthStateContext.Provider value={state}>
        <>{children}</>
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  )
}

export const useAuthState = () => useContext(AuthStateContext)
export const useAuthDispatch = () => useContext(AuthDispatchContext)
