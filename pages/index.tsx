import Counter from 'components/Counter'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import Header from 'components/Header'

export default () => {
  return (
    <>
      <GetStartedBroadcast />
      <Header title={false} />
      <p>Schedules selector</p>
      <p>Schedules container</p>
      <div className="container hero bg-gray-300">
        Hello world! <Counter />
      </div>
    </>
  )
}
