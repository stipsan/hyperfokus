import { useReduceMotion } from 'hooks/motion'
import { useObserveSession } from 'hooks/session'
import type { AppProps } from 'next/app'
import Head from 'next/head'
//import { analytics } from 'firebase'
import Router from 'next/router'
import { memo, Suspense, useEffect } from 'react'
import { Globals } from 'react-spring'
import { RecoilRoot } from 'recoil'
// global css, exempt from CSS module restrictions
import 'styles/_app.css'
// Loaded to initiate automatic analytics and performance metrics
import firebase from 'utils/firebase'

// @TODO extract more into dynamically imported components to see if it can improve First Load JS stats

const ObserveSession = memo(() => {
  // Ensures the current database provider is broadcast to other tabs, ensuring they're in sync
  useObserveSession()

  return null
})

export default ({ Component, pageProps }: AppProps) => {
  // Suspense fallbacks are invisible for a set delay to avoid spinner flash on first load
  // and adding this class ensures it's turned off in case something else is suspended after
  // the app is fully loaded and the user navigates somewhere
  useEffect(() => document.body.classList.add('loaded'), [])

  // Globally disable animations when the user don't want them
  const prefersReducedMotion = useReduceMotion()
  useEffect(() => {
    Globals.assign({
      skipAnimation: prefersReducedMotion,
    })
  }, [prefersReducedMotion])

  useEffect(() => {
    const handleRouteChange = (url) => {
      firebase.analytics().logEvent(firebase.analytics.EventName.PAGE_VIEW, {
        page_path: url,
      })
    }
    Router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
      </Head>
      <RecoilRoot>
        <Suspense
          fallback={
            <div className="my-40 text-xl text-blue-900 text-center loading">
              Loading...
            </div>
          }
        >
          <ObserveSession />
          <Component {...pageProps} />
        </Suspense>
      </RecoilRoot>
    </>
  )
}
