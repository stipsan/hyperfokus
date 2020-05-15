import { createContext, useState, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

type SessionState = '' | 'localstorage' | 'firebase'

const SessionValueContext = createContext<SessionState>(undefined)
const SessionSetStateContext = createContext<
  Dispatch<SetStateAction<SessionState>>
>(undefined)

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<SessionState>(
    typeof window === 'undefined'
      ? ''
      : () => {
          const unsafeState = localStorage.getItem(
            'hyperfokus.storage'
          ) as SessionState
          switch (unsafeState) {
            case 'localstorage':
            case 'firebase':
              return unsafeState
            default:
              return ''
          }
        }
  )

  return (
    <SessionSetStateContext.Provider value={setSession}>
      <SessionValueContext.Provider value={session}>
        {children}
      </SessionValueContext.Provider>
    </SessionSetStateContext.Provider>
  )
}

export const useSession = () => {
  // Suspend on the server only as we're reading the provider state from localStorage
  // which is a sync operation, thus we don't need to suspend on it in the client
  if (typeof window === 'undefined') {
    throw new Promise((resolve) => setTimeout(() => resolve()))
  }

  const session = useContext(SessionValueContext)

  // It's critical that this hook is never used outside a Provider, or it'll definitely cause bugs.
  // The state setter ensures that the value is only ever null if the provider is missing.
  if (session === undefined) {
    throw new TypeError(`useSession requires an SessionProvider wrapper`)
  }

  return session
}
