import cx from 'classnames'
import { useAuth, useAuthObserver } from 'hooks/auth'
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
        <div className="mt-3 sm:mt-0">
          You're logged in as: {auth().currentUser?.displayName}
        </div>
        <Button className={buttonClass} onClick={() => auth().signOut()}>
          Logout
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="mt-3 sm:mt-0">Step 1: start by logging in</div>
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

export default () => {
  useAuthObserver()

  return (
    <div
      className={cx('grid grid-cols-1 grid items-center gap-3', styles.grid)}
    >
      <AuthStep />
    </div>
  )
}
