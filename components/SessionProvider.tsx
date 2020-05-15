import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react'
import type { Dispatch, SetStateAction } from 'react'

type SessionState = '' | 'demo' | 'localstorage' | 'firebase'

const SessionValueContext = createContext<SessionState>(undefined)
const SessionSetStateContext = createContext<
  Dispatch<SetStateAction<SessionState>>
>(undefined)

const sanitize = (unsafeState: SessionState): SessionState => {
  switch (unsafeState) {
    case 'demo':
    case 'firebase':
    case 'localstorage':
      return unsafeState
    default:
      return ''
  }
}

const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionState>(
    typeof window === 'undefined'
      ? ''
      : () =>
          sanitize(localStorage.getItem('hyperfokus.storage') as SessionState)
  )

  useEffect(() => localStorage.setItem('hyperfokus.storage', session), [
    session,
  ])

  return (
    <SessionSetStateContext.Provider value={setSession}>
      <SessionValueContext.Provider value={session}>
        {children}
      </SessionValueContext.Provider>
    </SessionSetStateContext.Provider>
  )
}
export default Provider

export const useSessionValue = () => {
  // Suspend on the server only as we're reading the provider initial state from localStorage
  // which is a sync operation, thus we don't need to suspend on it in the client
  if (typeof window === 'undefined') {
    throw new Promise((resolve) => setTimeout(() => resolve()))
  }

  const session = useContext(SessionValueContext)

  // It's critical that this hook is never used outside a Provider, or it'll definitely cause bugs.
  // The state setter ensures that the value is only ever null if the provider is missing.
  if (session === undefined) {
    throw new TypeError(`useSessionValue requires a SessionProvider wrapper`)
  }

  return session
}

export const useSessionSetState = () => {
  const setState = useContext(SessionSetStateContext)

  // It's critical that this hook is never used outside a Provider, or it'll definitely cause bugs.
  if (setState === undefined) {
    throw new TypeError(`useSessionSetState requires a SessionProvider wrapper`)
  }

  return useCallback((session: SessionState) => setState(sanitize(session)), [
    setState,
  ])
}
