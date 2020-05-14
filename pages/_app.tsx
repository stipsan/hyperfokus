import { Provider as AuthProvider } from 'components/Auth'
import HeadTitle from 'components/HeadTitle'
import type { AppProps } from 'next/app'

import 'styles/_app.css'

export default ({ Component, pageProps }: AppProps) => (
  <>
    <HeadTitle />
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  </>
)
