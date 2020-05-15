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

let promise = null
let isResolved = false

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  if (!isResolved) {
    if (promise === null) {
      promise = new Promise((resolve) => {
        setTimeout(() => {
          isResolved = true
          resolve()
        }, 6000)
      })
    }
    throw promise
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
