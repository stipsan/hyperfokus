import { useSessionValue } from 'hooks/session'
import { selectorFamily, useRecoilValue } from 'recoil'

let test = null

const loadDatabase = (provider) => {
  console.log('loadDatabase', provider)
  switch (provider) {
    case 'localstorage':
      return import('database/localstorage')
    case 'demo':
      return import('database/demo')
    default:
      throw new TypeError(`Invalid provider: ${provider}`)
  }
}

// @TODO move away from using recoil to load db for now, wait with using recoil elsewhere until it's mature
const databaseProvider = selectorFamily({
  key: 'DatabaseProvider',
  get: (session) => async ({ get }) => {
    console.log('databaseProvider!', get, session)
    //const provider = get(sessionProviderState)

    console.log('session', session)
    if (!test) {
      test = session
      //  test = await loadDatabase(session)
    }

    return test
  },
})

export const useDatabase = () => {
  // @TODO Workaround infinite loop
  const session = useSessionValue()

  const provider = useRecoilValue(databaseProvider(session))

  return provider
}
