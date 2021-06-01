import { useEffect } from 'react'
import create from 'zustand'

export const sessionKey = 'hyperfokus.storage'
export type SessionState = '' | 'demo' | 'localstorage' | 'firebase'

export const sanitize = (unsafeState: SessionState): SessionState => {
  switch (unsafeState) {
    case 'demo':
    case 'firebase':
    case 'localstorage':
      return unsafeState
    default:
      return ''
  }
}

type SessionStoreState = {
  session: SessionState
  setSession: (session: SessionState) => void
}

const useStore = create<SessionStoreState>((set) => ({
  session:
    typeof window !== 'undefined'
      ? sanitize(localStorage.getItem(sessionKey) as SessionState)
      : '',
  setSession: (session: SessionState) => set({ session }),
}))

const selectSession = (state: SessionStoreState) => state.session
export const useSessionValue = () => {
  // Suspend on the server only as we're reading the provider initial state from localStorage
  // which is a sync operation, thus we don't need to suspend on it in the client
  if (typeof window === 'undefined') {
    throw new Promise((resolve) => setTimeout(() => resolve(void 0)))
  }

  const session = useStore(selectSession)

  return session
}

const selectSetSession = (state: SessionStoreState) => state.setSession
const useSetSession = () => {
  const setState = useStore(selectSetSession)
  // States that need to be reset when changing session

  return setState
}

export const useSessionSetState = () => {
  const prevState = useStore(selectSession)
  const setSession = useSetSession()

  return (unsafeSession: SessionState) => {
    const session = sanitize(unsafeSession)

    if (prevState === session) {
      console.warn('No-op for setSession:', {
        unsafeSession,
        session,
        prevState,
      })
      return
    }

    setSession(session)
    localStorage.setItem(sessionKey, session)
  }
}

export const useObserveSession = () => {
  const prevState = useStore(selectSession)
  const setSession = useSetSession()

  useEffect(() => {
    // Cross-tab events
    const handler = (event: StorageEvent) => {
      if (event.key !== sessionKey) {
        return
      }
      const newValue = sanitize(event.newValue as SessionState)
      if (newValue === prevState) {
        return
      }

      setSession(newValue)
    }
    window.addEventListener('storage', handler)

    // Check if local state has changed since startup began
    const currentState = sanitize(
      localStorage.getItem(sessionKey) as SessionState
    )
    if (prevState !== currentState) {
      setSession(currentState)
    }

    return () => {
      window.removeEventListener('storage', handler)
    }
  }, [prevState, setSession])
}
