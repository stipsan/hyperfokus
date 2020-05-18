import Head from 'next/head'

type Props = {
  children: string
}

export default ({ children }: Props) => (
  <Head>
    <title>{children} | HyperFokus</title>
  </Head>
)
