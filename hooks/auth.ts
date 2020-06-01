import type { User } from 'firebase'
import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil'
import auth from 'utils/auth'

export const authState = atom<User>({
  key: 'auth',
  default: undefined,
})
const asyncAuthState = selector<User>({
  key: 'asyncAuthState',
  get: async ({ get }) => {
    try {
      const cache = get(authState)

      // It's only undefined when it should be fetched
      if (cache === undefined) {
        await new Promise((resolve) => setTimeout(() => resolve(), 3000))
        return await new Promise((resolve, reject) => {
          const unsubscribe = auth().onAuthStateChanged(
            (user) => {
              if (user) {
                console.log('Logged in', user, unsubscribe, auth().currentUser)
                // User is signed in.
              } else {
                console.log('Guest', user, unsubscribe, auth().currentUser)
              }

              unsubscribe()
              // JSON cloning to avoid circular references breaking recoil
              // @TODO check if https://github.com/facebookexperimental/Recoil/pull/153 fixes it
              resolve(JSON.parse(JSON.stringify(user)))
            },
            (error) => reject(error)
          )
        })
      }

      return cache
    } catch (err) {
      console.error('oh no wtf!', err)
    }
  },
  set: ({ set }, newValue) => set(authState, newValue),
})

// State setter and getter, useful when managing the auth
export const useAuth = (): User => {
  const auth = useRecoilValue(asyncAuthState)

  return auth
}

// This hook ensures changes to the state after initial fetch is in sync
export const useAuthObserver = () => {
  const setAuth = useSetRecoilState(authState)

  // Sync the state in case it's been updated
  /*
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      (user) => setAuth(user),
      (err) => console.error(err)
    )

    return () => unsubscribe()
  }, [])
  // */
}
