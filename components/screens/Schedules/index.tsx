import { useSessionValue } from 'hooks/session'
import { lazy } from 'react'

const Demo = lazy(() => import('./Demo'))
//const Firebase = lazy(() => import('./Firebase'))
//const Localstorage = lazy(() => import('./Localstorage'))

export default function SchedulesScreen() {
  const session = useSessionValue()
  switch (session) {
    case 'demo':
      return <Demo />
    case 'firebase':
    //return <Firebase />
    case 'localstorage':
    //return <Localstorage />
    default:
      throw new TypeError(`Invalid session: ${session}`)
  }
}
