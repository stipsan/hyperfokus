import HeadTitle from 'components/HeadTitle'
import SessionProvider from 'components/SessionProvider'
import type { AppProps } from 'next/app'
import { Suspense, useEffect } from 'react'
import { RecoilRoot } from 'recoil'

import 'styles/_app.css'

// @TODO install @types/recoil when available

export default ({ Component, pageProps }: AppProps) => {
  // Suspense fallbacks are invisible for a set delay to avoid spinner flash on first load
  // and adding this class ensures it's turned off in case something else is suspended after
  // the app is fully loaded and the user navigates somewhere
  useEffect(() => document.body.classList.add('loaded'), [])

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-700 text-xl w-screen loading">
          Loading...
        </div>
      }
    >
      <HeadTitle />
      <RecoilRoot>
        <SessionProvider>
          <Component {...pageProps} />
        </SessionProvider>
      </RecoilRoot>
    </Suspense>
  )
}
