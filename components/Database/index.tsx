/**
 * The desired provider is provided by the AuthProvider.
 * Even if the user desires to use firebase it doesn't mean the user can.
 * 1. Check if the user is logged in.
 * 2. Is the user in the beta?
 * 3. Is the user opted in to use cloud sync?
 * If firebase fails, use localstorage instead.
 * 1. Can localstorage be used? Check if the user is in a mode where it fails (like incognito or safari in private mode).
 * If not then fallback to demo but store each failed test in a report state.
 */

export default () => null
