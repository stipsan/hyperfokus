import { useEffect } from 'react'
import {
  atom,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil'
import firebase from 'utils/firebase'
import { schedulesState } from './schedules'
import { todosState } from './todos'

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

export const sessionProviderState = atom({
  key: 'SessionProvider',
  default: '',
})

export const useSessionValue = () => {
  // Suspend on the server only as we're reading the provider initial state from localStorage
  // which is a sync operation, thus we don't need to suspend on it in the client
  if (typeof window === 'undefined') {
    throw new Promise((resolve) => setTimeout(() => resolve()))
  }

  const session = useRecoilValue(sessionProviderState)

  return session as SessionState
}

const useSetSession = () => {
  const setState = useSetRecoilState(sessionProviderState)
  // States that need to be reset when changing session
  const resetSchedules = useResetRecoilState(schedulesState)
  const resetTodos = useResetRecoilState(todosState)

  return (session: SessionState) => {
    setState(session)
    resetSchedules()
    resetTodos()
    firebase.analytics().setUserProperties({ session })
  }
}

export const useSessionSetState = () => {
  const prevState = useRecoilValue(sessionProviderState)
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
  const prevState = useRecoilValue(sessionProviderState)
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
    return () => {
      window.removeEventListener('storage', handler)
    }
  }, [prevState])
}
