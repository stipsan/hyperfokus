import { Provider as AuthProvider } from 'components/Auth'
import HeadTitle from 'components/HeadTitle'
import type { AppProps } from 'next/app'
import { Suspense } from 'react'
import { RecoilRoot } from 'recoil'

import 'styles/_app.css'

// @TODO install @types/recoil when available

export default ({ Component, pageProps }: AppProps) => (
  <Suspense fallback={'Loading...'}>
    <HeadTitle />
    <RecoilRoot>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </RecoilRoot>
  </Suspense>
)
