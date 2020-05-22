import type { DatabaseType } from 'database/types'
import { sessionProviderState, useSessionValue } from 'hooks/session'
import type { SessionState } from 'hooks/session'

const loading = new Map()
const loaded = new Map<SessionState, DatabaseType>()

const loadDatabase = async (provider) => {
  switch (provider) {
    case 'localstorage':
      return import('database/localstorage')
    case 'demo':
      return import('database/demo')
    default:
      throw new TypeError(`Invalid provider: ${provider}`)
  }
}

// For usage in selectors
export const getDatabase = async ({ get }) => {
  const { default: db } = await loadDatabase(get(sessionProviderState))
  return db
}

export const useDatabase = () => {
  const session = useSessionValue()

  // @TODO move to the selector
  // Ensure this hook is never called without a valid provider
  if (session !== 'localstorage' && session !== 'demo') {
    throw new TypeError(
      session ? `Invalid provider: ${session}` : 'No database provider set'
    )
  }

  if (loaded.has(session)) {
    return loaded.get(session)
  }

  if (!loading.has(session)) {
    loading.set(
      session,
      loadDatabase(session).then(
        (database) => loaded.set(session, database.default),
        (reason) => console.error(reason)
      )
    )
  }

  // Suspend on the loading promise
  throw loading.get(session)
}
