import {
  atom,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil'
import { schedulesState } from './schedules'
import { todosState } from './todos'

export type SessionState = '' | 'demo' | 'localstorage' | 'firebase'

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

export const sessionProviderState = atom({
  key: 'SessionProvider',
  default:
    typeof window === 'undefined'
      ? ('' as SessionState)
      : sanitize(localStorage.getItem('hyperfokus.storage') as SessionState),
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

export const useSessionSetState = () => {
  const prevState = useRecoilValue(sessionProviderState)
  const setState = useSetRecoilState(sessionProviderState)
  // States that need to be reset when changing session
  const resetSchedules = useResetRecoilState(schedulesState)
  const resetTodos = useResetRecoilState(todosState)

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

    setState(session)
    resetSchedules()
    resetTodos()
    localStorage.setItem('hyperfokus.storage', session)
  }
}
