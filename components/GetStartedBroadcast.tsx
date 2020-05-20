import cx from 'classnames'
import { useSessionSetState, useSessionValue } from 'hooks/session'
import { useEffect, useRef } from 'react'
import styles from './GetStartedBroadcast.module.css'

// @TODO change behavior if the user clicks "Stop the demo, I'm ready!"
// just in case the "Get started" button is missed on the start page.
// One solution is to use an atom to track if the button has been pressed multiple times, and if so just
// trigger the "Get started" flow anyway.

export default () => {
  const session = useSessionValue()
  const setSession = useSessionSetState()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session === 'demo' && containerRef.current) {
      const { height } = containerRef.current.getBoundingClientRect()
      document.body.style.setProperty('--demo-notification', `${height}px`)
      return () => {
        document.body.style.removeProperty('--demo-notification')
      }
    }
  }, [session])

  if (session !== 'demo') {
    return null
  }

  return (
    <div
      className={cx(
        styles.broadcast,
        'bg-yellow-100 border-t-4 border-yellow-500 px-inset py-3 shadow-inner shadow-inset text-yellow-900'
      )}
      role="alert"
      ref={containerRef}
    >
      <p className="font-bold">Demo mode</p>
      <p className="text-sm">
        You can look around and try things out as much as you like.
      </p>
      <button
        className="inline-block text-sm font-bold rounded-full text-yellow-100 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 py-1 px-2 mt-1 focus:outline-none focus:shadow-outline"
        onClick={() => {
          setSession('localstorage')
        }}
      >
        Stop the demo, I'm ready!
      </button>
    </div>
  )
}
