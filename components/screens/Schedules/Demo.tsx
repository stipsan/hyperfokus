import { useSessionValue } from 'hooks/session'
import SchedulesProviderDemo, {
  useSchedules,
} from 'components/SchedulesProvider/Demo'
import LazySchedules from './LazySchedules'
import { lazy, useMemo } from 'react'

export default function SchedulesDemoScreen() {
  const schedules = useSchedules()

  return (
    <SchedulesProviderDemo>
      <LazySchedules schedules={schedules} />
    </SchedulesProviderDemo>
  )
}
