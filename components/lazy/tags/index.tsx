import { useSessionValue } from 'hooks/session'
import { lazy } from 'react'

const Demo = lazy(() => import('./demo'))
const Firebase = lazy(() => import('./firebase'))
const Localstorage = lazy(() => import('./localstorage'))

export default function LazyTags() {
  const session = useSessionValue()
  switch (session) {
    case 'demo':
      return <Demo />
    case 'firebase':
      return <Firebase />
    case 'localstorage':
      return <Localstorage />
    default:
      throw new TypeError(`Invalid session: ${session}`)
  }
}
