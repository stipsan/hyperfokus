import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider as AuthProvider } from '../components/Auth'

import '../styles/_app.css'

export default ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <title>This page has a title 🤔</title>
    </Head>
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  </>
)
