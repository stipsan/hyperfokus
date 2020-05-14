import Head from 'next/head'

type Props = {
  children?: string
}

const baseTitle = 'HyperFokus'

export default ({ children }: Props) => (
  <Head>
    <title>{children ? `${children} | ${baseTitle}` : baseTitle}</title>
  </Head>
)
