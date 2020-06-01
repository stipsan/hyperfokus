import { useEffect } from 'react'
import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil'
import auth from 'utils/auth'

export const authState = atom<boolean>({
  key: 'auth',
  default: undefined,
})
const asyncAuthState = selector<boolean>({
  key: 'asyncAuthState',
  get: async ({ get }) => {
    // @TODO deal specifically with the error codes that can happen in this callback
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth#getredirectresult
    await auth().getRedirectResult()

    try {
      const cache = get(authState)

      // It's only undefined when it should be fetched
      if (cache === undefined) {
        //await new Promise((resolve) => setTimeout(() => resolve(), 3000))
        return await new Promise((resolve, reject) => {
          const unsubscribe = auth().onAuthStateChanged(
            (user) => {
              unsubscribe()
              resolve(!!user)
            },
            (error) => {
              unsubscribe()
              reject(error)
            }
          )
        })
      }

      return cache
    } catch (err) {
      console.error('oh no failed to get auth state!', err)
    }
  },
  set: ({ set }, newValue) => set(authState, newValue),
})

// State setter and getter, useful when managing the auth
export const useAuth = () => {
  const auth = useRecoilValue(asyncAuthState)

  return auth
}

// This hook ensures changes to the state after initial fetch is in sync
export const useAuthObserver = () => {
  const setAuth = useSetRecoilState(authState)

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      (user) => setAuth(!!user),
      (err) => console.error(err)
    )

    return () => unsubscribe()
  }, [])
}
