import cx from 'classnames'
import firebase from 'firebase/app'
import type { User } from 'firebase/app'
import { useLogException } from 'hooks/analytics'
// @ts-expect-error
import { Suspense, unstable_SuspenseList as SuspenseList } from 'react'
import {
  AuthCheck,
  useAuth,
  useFirestore,
  useFirestoreDocData,
  useUser,
} from 'reactfire'
import Button from './Button'
import styles from './CloudSyncSettings.module.css'

const buttonClass = 'bg-gray-100 hover:bg-gray-300 text-gray-800 font-semibold'

const AuthStep = () => {
  const auth = useAuth()
  const user = useUser<User>()
  const logException = useLogException()
  console.log({ auth })

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
            logException(error)
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
  const logException = useLogException()
  const betaReqRef = firestore.collection('betarequests').doc(user.uid)
  const betaReq = useFirestoreDocData<{
    email?: string
    name?: string
    message?: string
  }>(betaReqRef)
  const betaInviteRef = firestore.collection('betainvites').doc(user.uid)
  const betaInvite = useFirestoreDocData<{
    since?: Date
  }>(betaInviteRef)

  const cancel = async () => {
    try {
      await betaReqRef.delete()
    } catch (error) {
      logException(error)
    }
  }

  if (betaInvite.since) {
    console.log({ betaInvite })
    return (
      <>
        <div className="mt-8 sm:mt-0">You've requested beta access.</div>
        <Button className={buttonClass} onClick={cancel}>
          Cancel
        </Button>
      </>
    )
  }

  if (betaReq.email) {
    return (
      <>
        <div className="mt-8 sm:mt-0">You've requested beta access.</div>
        <Button className={buttonClass} onClick={cancel}>
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
            logException(error)
          }
        }}
      >
        Request beta access
      </Button>
    </>
  )
}

export default () => (
  <>
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
  </>
)
