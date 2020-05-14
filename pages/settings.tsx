import { useAuthState } from 'components/Auth'
import Header from 'components/Header'
import HeadTitle from 'components/HeadTitle'

const title = 'Settings'

export default () => {
  const authState = useAuthState()

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <Header title={title} />
      <h1 className="text-gray-900">
        The auth provider is {authState.provider}.
      </h1>
    </>
  )
}
