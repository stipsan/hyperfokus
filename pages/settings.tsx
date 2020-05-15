import Header from 'components/Header'
import HeadTitle from 'components/HeadTitle'

const title = 'Settings'

export default () => {
  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <Header title={title} />
    </>
  )
}
