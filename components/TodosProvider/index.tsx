import { useSessionValue } from 'hooks/session'
import type { SessionState } from 'hooks/session'
import { lazy, useMemo } from 'react'
import type { ReactNode } from 'react'

const Demo = lazy(() => import('./Demo'))
const Firebase = lazy(() => import('./Firebase'))
const Localstorage = lazy(() => import('./Localstorage'))

const getProvider = (session: SessionState) => {
  switch (session) {
    case 'demo':
      return Demo
    case 'firebase':
      return Firebase
    case 'localstorage':
      return Localstorage
    default:
      throw new TypeError(`Invalid provider: ${session}`)
  }
}

export { useTodos, useTodosDispatch } from './Context'

export default ({ children }: { children: ReactNode }) => {
  const session = useSessionValue()
  const Provider = useMemo(() => getProvider(session), [session])

  return <Provider>{children}</Provider>
}
