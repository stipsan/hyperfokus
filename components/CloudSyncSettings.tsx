import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import auth from 'utils/auth'
import firebase from 'utils/firebase'

const title = 'Settings'

// @TODO move into utils/auth
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
}

export default () => (
  <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />
)
