import cx from 'classnames'
import 'firebase/firestore'
import { authState, useAuth, useAuthObserver } from 'hooks/auth'
// @ts-expect-error
import { Suspense, unstable_SuspenseList as SuspenseList } from 'react'
import { atom, selector, useRecoilState } from 'recoil'
import auth from 'utils/auth'
import firebase from 'utils/firebase'
import Button from './Button'
import styles from './CloudSyncSettings.module.css'

const buttonClass = 'bg-gray-100 hover:bg-gray-300 text-gray-800 font-semibold'

const AuthStep = () => {
  const loggedIn = useAuth()

  if (loggedIn) {
    return (
      <>
        <div>
          You're logged in as: {auth().currentUser?.displayName} (
          {auth().currentUser?.email})
        </div>
        <Button className={buttonClass} onClick={() => auth().signOut()}>
          Logout
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="mt-8 sm:mt-0">Start by signing in</div>
      <Button
        className={cx(buttonClass, 'flex items-center')}
        onClick={async () => {
          try {
            await auth().signInWithRedirect(
              new firebase.auth.GoogleAuthProvider()
            )
          } catch (error) {
            firebase
              .analytics()
              .logEvent(firebase.analytics.EventName.EXCEPTION, {
                fatal: true,
                description: error.toString(),
                error,
              })
            alert(error)
          }
        }}
      >
        <img
          alt="Google logo"
          className="h-6 w-6"
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        />
        <span className="ml-2">Sign in with Google</span>
      </Button>
    </>
  )
}

const requestBetaAtom = atom<null | {
  email?: string
  name?: string
  message?: string
}>({
  key: 'requestBetaAtom',
  default: undefined,
})
const requestBetaState = selector<null | {
  email?: string
  name?: string
  message?: string
}>({
  key: 'requestBetaState',
  get: async ({ get }) => {
    const cache = get(requestBetaAtom)
    const loggedIn = get(authState)

    if (cache !== undefined) {
      return cache
    }

    try {
      // It's only undefined when it should be fetched
      if (loggedIn) {
        //await new Promise((resolve) => setTimeout(() => resolve(), 3000))
        const betaRequest = await firebase
          .firestore()
          .collection('betarequests')
          .doc(firebase.auth().currentUser.uid)
          .get()
        if (betaRequest.exists) {
          return betaRequest.data()
        }
      }

      return new Promise((resolve) => setTimeout(() => resolve(null), 1000))
    } catch (err) {
      console.error('oh no failed to get auth state!', err)
    }
  },
  set: ({ set }, newValue) => set(requestBetaAtom, newValue),
})

const RequestStep = () => {
  const loggedIn = useAuth()
  const [betaRequest, setBetaRequest] = useRecoilState(requestBetaState)

  if (!loggedIn) {
    return null
  }

  if (betaRequest) {
    return (
      <>
        <div className="mt-8 sm:mt-0">You've requested beta access.</div>
        <Button
          className={buttonClass}
          onClick={async () => {
            const { uid } = auth().currentUser
            try {
              await firebase
                .firestore()
                .collection('betarequests')
                .doc(uid)
                .delete()
              setBetaRequest(null)
            } catch (error) {
              firebase
                .analytics()
                .logEvent(firebase.analytics.EventName.EXCEPTION, {
                  fatal: true,
                  description: error.toString(),
                  error,
                })
              alert(error)
            }
          }}
        >
          Cancel
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="mt-8 sm:mt-0">Then request beta access</div>
      <Button
        className={cx('flex items-center')}
        variant="primary"
        onClick={async () => {
          const { uid, displayName, email } = auth().currentUser
          const betaRequest = { name: displayName, email, message: '' }
          try {
            await firebase
              .firestore()
              .collection('betarequests')
              .doc(uid)
              .set(betaRequest)
            setBetaRequest(betaRequest)
          } catch (error) {
            firebase
              .analytics()
              .logEvent(firebase.analytics.EventName.EXCEPTION, {
                fatal: true,
                description: error.toString(),
                error,
              })
            alert(error)
          }
        }}
      >
        Request beta access
      </Button>
    </>
  )
}

export default () => {
  useAuthObserver()

  return (
    <div
      className={cx(
        'grid grid-cols-1 grid items-center gap-3 sm:row-gap-8',
        styles.grid
      )}
    >
      <SuspenseList>
        <Suspense
          fallback={
            <>
              <div className="py-2">Loading auth step...</div>
              <span />
            </>
          }
        >
          <AuthStep />
        </Suspense>
        <Suspense
          fallback={
            <>
              <div className="py-2">Loading request step...</div>
              <span />
            </>
          }
        >
          <RequestStep />
        </Suspense>
      </SuspenseList>
    </div>
  )
}
