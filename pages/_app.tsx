import HeadTitle from 'components/HeadTitle'
import { useReduceMotion } from 'hooks/motion'
import type { AppProps } from 'next/app'
import { Suspense, useEffect } from 'react'
import { Globals } from 'react-spring'
import { RecoilRoot } from 'recoil'
import 'styles/_app.css'

// @TODO install @types/recoil when available

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
    <Suspense
      fallback={
        <div className="my-40 text-xl text-blue-900 text-center loading">
          Loading...
        </div>
      }
    >
      <HeadTitle />
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    </Suspense>
  )
}
