import type { AppProps } from 'next/app'
import Head from 'next/head'
import { lazy, Suspense, useEffect, useState } from 'react'
import { FirebaseAppProvider } from 'reactfire'
// global css, exempt from CSS module restrictions
import 'styles/_app.css'
import 'react-spring-bottom-sheet/dist/style.css'

const SessionObserver = lazy(() => import('components/SessionObserver'))
const RouteObserver = lazy(() => import('components/RouteObserver'))
const PerformanceObserver = lazy(() => import('components/PerformanceObserver'))

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export default function _AppPage({ Component, pageProps }: AppProps) {
  // Suspense fallbacks are invisible for a set delay to avoid spinner flash on first load
  // and adding this class ensures it's turned off in case something else is suspended after
  // the app is fully loaded and the user navigates somewhere
  useEffect(() => document.body.classList.add('loaded'), [])

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
      </Head>
      <FirebaseAppProvider firebaseConfig={config}>
        <Suspense
          fallback={
            <div className="my-40 text-xl text-blue-900 text-center loading">
              Loading...
            </div>
          }
        >
          <Component {...pageProps} />
          {mounted && (
            <Suspense fallback={null}>
              <SessionObserver />
              <RouteObserver />
              <PerformanceObserver />
            </Suspense>
          )}
        </Suspense>
      </FirebaseAppProvider>
    </>
  )
}
