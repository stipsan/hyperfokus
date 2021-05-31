import SchedulesProvider from 'components/SchedulesProvider'
import LazySchedules from './LazySchedules'

export default function SchedulesScreen() {
  return (
    <SchedulesProvider>
      <LazySchedules />
    </SchedulesProvider>
  )
}
