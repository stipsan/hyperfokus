import { useAuth, useAuthObserver } from 'hooks/auth'
import { Suspense, useState } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import auth from 'utils/auth'
import firebase from 'utils/firebase'

// @TODO move into utils/auth
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
}

const useUser = () => {
  // Used just to make react rerender the components without cloning the auth object in local state
  const [initialized, forceStateUpdate] = useState<true | false | undefined>()
  console.log('initialized', initialized)

  if (initialized !== undefined) {
    return firebase.auth().currentUser
  }
  throw new Promise((resolve) => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('Logged in', user, unsubscribe, firebase.auth().currentUser)
        // User is signed in.
      } else {
        console.log('Guest', user, unsubscribe, firebase.auth().currentUser)
      }
      // 2. Purging the ref ensures the hook won't suspend render again by throwing this promice
      //promise.current = null
      // 3. onAuthStateChanged can fire multiple times, and there's no built in "once" functionality
      //unsubscribe()
      // 1. Resolving the promise allows react to resume render
      resolve()
      forceStateUpdate(!!user)
    })
  })

  /*
  useEffect(() => {
    console.log('useEffect in useUser', firebase.auth().currentUser)
    forceStateUpdate(true)
  }, [])

  const promise = useRef<{ resolve: () => void }>()

  if (initialized === undefined && !promise.current) {
    throw new Promise((resolve) => {
      promise.current = { resolve }
    })
  }
  if (initialized !== undefined && promise.current) {
    console.count('promise.current.resolve()')
    promise.current.resolve()
  }
  // */

  /*

  // Technique that suspends render until the initial auth state is determined
  const promise = useRef<undefined | null | Promise<unknown>>(undefined)
  if (promise.current === undefined) {
    console.log('promise.current', promise.current)
    console.count('What is going on')
    promise.current = new Promise((resolve) => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          console.log(
            'Logged in',
            user,
            unsubscribe,
            firebase.auth().currentUser
          )
          // User is signed in.
        } else {
          console.log('Guest', user, unsubscribe, firebase.auth().currentUser)
        }
        // 2. Purging the ref ensures the hook won't suspend render again by throwing this promice
        //promise.current = null
        // 3. onAuthStateChanged can fire multiple times, and there's no built in "once" functionality
        unsubscribe()
        // 1. Resolving the promise allows react to resume render
        resolve()
      })
    })
  }
  if (promise.current) {
    console.log('promise.current again', promise.current)
    // Suspending render!
    throw promise.current
  }
  // */

  return firebase.auth().currentUser
}

export default () => {
  useAuthObserver()
  const user = useAuth()
  console.log({ user }, auth().currentUser)
  console.count('CloudSyncSettings render')
  return (
    <Suspense fallback="Loading…">
      Long grid: {auth().currentUser?.displayName}
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />
    </Suspense>
  )
}
