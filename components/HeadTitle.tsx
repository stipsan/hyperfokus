import Head from 'next/head'

type Props = {
  children: string
}

export default ({ children }: Props) => (
  <Head>
    <title>
      {children} | {process.env.NEXT_PUBLIC_APP_NAME}
    </title>
  </Head>
)
