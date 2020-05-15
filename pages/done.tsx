import { useSessionValue } from 'components/SessionProvider'
import Header from 'components/Header'
import HeadTitle from 'components/HeadTitle'
import Link from 'next/link'

const title = 'Completed Activities'

export default () => {
  const session = useSessionValue()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <Header title={title} />
      <h1 className="text-gray-900">The session provider is {session}.</h1>
    </>
  )
}
