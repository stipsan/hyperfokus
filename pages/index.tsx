import GetStartedBroadcast from 'components/GetStartedBroadcast'
import { AppLayout } from 'components/layouts'

export default () => {
  return (
    <AppLayout>
      <GetStartedBroadcast />
      <p>Schedules selector</p>
      <p>Schedules container</p>
      <button
        onClick={() => {
          throw new Error('Uh oh!')
        }}
      >
        Throw error
      </button>
      <div className="bg-gray-300 min-h-screen">Hello world!</div>
    </AppLayout>
  )
}
