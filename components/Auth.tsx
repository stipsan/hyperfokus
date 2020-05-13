import { createContext, useReducer, useContext } from 'react'
import type { Dispatch } from 'react'

type AuthActions = { type: 'LOGIN' } | { type: 'LOGOUT' }

type AuthState = {
  provider: 'demo' | 'localstorage' | 'firebase'
}

const AuthStateContext = createContext<AuthState>({ provider: 'demo' })

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
  const [state, dispatch] = useReducer(reducer, { provider: 'demo' })

  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthStateContext.Provider value={state}>
        {children}
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  )
}

export const useAuthState = () => useContext(AuthStateContext)
export const useAuthDispatch = () => useContext(AuthDispatchContext)
