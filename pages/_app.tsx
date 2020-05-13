import type { AppProps } from 'next/app'
import { Provider as AuthProvider } from '../components/Auth'

import '../styles/_app.css'

export default ({ Component, pageProps }: AppProps) => (
  <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
)
