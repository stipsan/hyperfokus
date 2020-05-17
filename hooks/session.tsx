import { useCallback } from 'react'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'

type SessionState = '' | 'demo' | 'localstorage' | 'firebase'

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

const sessionProviderState = atom({
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
  const setState = useSetRecoilState(sessionProviderState)

  return useCallback(
    (unsafeSession: SessionState) => {
      const session = sanitize(unsafeSession)
      setState(session)
      localStorage.setItem('hyperfokus.storage', session)
    },
    [setState]
  )
}
