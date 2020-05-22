import { useReduceMotion } from 'hooks/motion'
import { useObserveSession } from 'hooks/session'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { memo, Suspense, useEffect } from 'react'
import { Globals } from 'react-spring'
import { RecoilRoot } from 'recoil'
import 'styles/_app.css'

// @TODO install @types/recoil when available

const ObserveSession = memo(() => {
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

  return (
    <>
      <Head>
        <title>HyperFokus</title>
        <meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
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
