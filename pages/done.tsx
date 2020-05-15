import GetStartedBroadcast from 'components/GetStartedBroadcast'
import Header from 'components/Header'
import HeadTitle from 'components/HeadTitle'
import { useSessionValue } from 'components/SessionProvider'

const title = 'Completed Activities'

export default () => {
  const session = useSessionValue()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <Header title={title} />
      <GetStartedBroadcast />
      <h1 className="text-gray-900">The session provider is {session}.</h1>
    </>
  )
}
