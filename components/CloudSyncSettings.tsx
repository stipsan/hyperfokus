import cx from 'classnames'
import localStorage from 'database/localstorage'
import firebase from 'firebase/app'
import type { User } from 'firebase/app'
import { useAnalytics, useLogException } from 'hooks/analytics'
import { useSessionSetState, useSessionValue } from 'hooks/session'
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

  if (user) {
    return (
      <>
        <div>
          Step 1: You're logged in as {user.displayName} ({user.email})
        </div>
        <Button className={buttonClass} onClick={() => auth.signOut()}>
          Logout
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="mt-8 sm:mt-0">Step 1: Start by signing in</div>
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

  if (betaInvite.since && betaReq.email) {
    return (
      <>
        <div className="mt-8 sm:mt-0">
          Step 2: Your beta request is approved.
        </div>
        <Button className={buttonClass} onClick={cancel}>
          Cancel
        </Button>
      </>
    )
  }

  if (betaReq.email) {
    return (
      <>
        <div className="mt-8 sm:mt-0">
          Step 2: You've requested beta access.
        </div>
        <Button className={buttonClass} onClick={cancel}>
          Cancel
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="mt-8 sm:mt-0">Step 2:</div>
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

const FinalStep = () => {
  const session = useSessionValue()
  const setSession = useSessionSetState()
  const analytics = useAnalytics()
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
  let canEnable = !!betaInvite.since && !!betaReq.email

  const enable = async () => {
    if (!canEnable) {
      analytics.logEvent('attempted_start_cloud_sync')
      return alert(`You need to finish step 2 first`)
    }

    try {
      const [localSchedules, localTodos] = await Promise.all([
        localStorage.getSchedules(),
        localStorage.getTodos(),
      ])

      const schedulesSnapshots = await firestore
        .collection('schedules')
        .where('author', '==', user.uid)
        .get()
      let schedulesId = ''
      schedulesSnapshots.forEach((snapshot) => {
        schedulesId = snapshot.id
      })

      // No schedules doc exists so lets make one
      if (schedulesId === '') {
        const newScheduleRef = await firestore
          .collection('schedules')
          .add({ author: user.uid })
        schedulesId = newScheduleRef.id
      }
      const schedulesRef = firestore.collection('schedules').doc(schedulesId)

      await firestore.runTransaction(async (transaction) => {
        const schedulesDoc = await transaction.get(schedulesRef)
        let { rules = [] } = schedulesDoc.data()

        const usedIds = new Set()
        rules = [...rules, ...localSchedules].filter((rule) => {
          if (usedIds.has(rule.id)) {
            return false
          }
          usedIds.add(rule.id)
          return true
        })

        await transaction.update(schedulesRef, { rules })
      })

      await Promise.all(
        localTodos.map(
          ({ id, completed = null, modified = null, ...localTodo }) =>
            firestore
              .collection('todos')
              .doc(`${user.uid}-${id}`)
              .set(
                { completed, modified, ...localTodo, author: user.uid },
                { merge: true }
              )
        )
      )

      setSession('firebase')
    } catch (err) {
      logException(err)
    }
  }
  const disable = async () => {
    setSession('localstorage')
  }

  return (
    <>
      <div className="mt-8 sm:mt-0">Step 3:</div>
      {session !== 'firebase' ? (
        <Button
          variant={canEnable ? 'primary' : undefined}
          className={canEnable ? undefined : buttonClass}
          onClick={enable}
        >
          Enable Cloud Sync
        </Button>
      ) : (
        <Button variant="danger" onClick={disable}>
          Disable Cloud Sync
        </Button>
      )}
    </>
  )
}

export default () => (
  <>
    <p className="mb-6">Enable Cloud Sync in 3 steps:</p>
    <div
      className={cx(
        'grid grid-cols-1 items-center gap-3 sm:gap-y-8',
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
        <Suspense
          fallback={
            <>
              <div className="py-2">Loading final step...</div>
              <span />
            </>
          }
        >
          <AuthCheck fallback={null}>
            <FinalStep />
          </AuthCheck>
        </Suspense>
      </SuspenseList>
    </div>
  </>
)
