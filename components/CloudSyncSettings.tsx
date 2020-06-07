import cx from 'classnames'
import type { User } from 'firebase/app'
import { useAnalytics } from 'hooks/analytics'
// @ts-expect-error
import { Suspense, unstable_SuspenseList as SuspenseList } from 'react'
import {
  AuthCheck,
  FirebaseAppProvider,
  useAuth,
  useFirestore,
  useFirestoreDocData,
  useUser,
} from 'reactfire'
import firebase, { config } from 'utils/firebase'
import Button from './Button'
import styles from './CloudSyncSettings.module.css'

const buttonClass = 'bg-gray-100 hover:bg-gray-300 text-gray-800 font-semibold'

const AuthStep = () => {
  const auth = useAuth()
  const user = useUser<User>()
  const analytics = useAnalytics()

  if (user) {
    return (
      <>
        <div>
          You're logged in as: {user.displayName} ({user.email})
        </div>
        <Button className={buttonClass} onClick={() => auth.signOut()}>
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
            await auth.signInWithRedirect(
              new firebase.auth.GoogleAuthProvider()
            )
          } catch (error) {
            analytics.logEvent(firebase.analytics.EventName.EXCEPTION, {
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

const RequestStep = () => {
  const user = useUser<User>()
  const firestore = useFirestore()
  const analytics = useAnalytics()
  const betaReqRef = firestore.collection('betarequests').doc(user.uid)
  const betaReq = useFirestoreDocData<{
    email?: string
    name?: string
    message?: string
  }>(betaReqRef)

  if (betaReq.email) {
    return (
      <>
        <div className="mt-8 sm:mt-0">You've requested beta access.</div>
        <Button
          className={buttonClass}
          onClick={async () => {
            try {
              await betaReqRef.delete()
            } catch (error) {
              analytics.logEvent(firebase.analytics.EventName.EXCEPTION, {
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
          const { displayName, email } = user
          const betaRequest = { name: displayName, email, message: '' }
          try {
            await betaReqRef.set(betaRequest)
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

export default () => (
  <FirebaseAppProvider firebaseConfig={config}>
    <p className="mb-6">Enable Cloud Sync in 3 steps:</p>
    <div
      className={cx(
        'grid grid-cols-1 grid items-center gap-3 sm:row-gap-8',
        styles.grid
      )}
    >
      <SuspenseList revealOrder="together">
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
          <AuthCheck fallback={null}>
            <RequestStep />
          </AuthCheck>
        </Suspense>
      </SuspenseList>
    </div>
  </FirebaseAppProvider>
)
