import Head from 'next/head'

type Props = {
  children: string
}

const HeadTitle = ({ children }: Props) => (
  <Head>
    <title>
      {children} | {process.env.NEXT_PUBLIC_APP_NAME}
    </title>
  </Head>
)

export default HeadTitle
