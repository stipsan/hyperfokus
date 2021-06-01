import { useSessionValue } from 'hooks/session'
import {
  useSchedules,
  useAddSchedule,
  useEditSchedule,
  useDeleteSchedule,
} from 'components/SchedulesProvider/Demo'
import SchedulesScreen from 'components/screens/schedules'
import { lazy, useMemo } from 'react'

export default function DemoSchedulesScreen() {
  const schedules = useSchedules()
  const addSchedule = useAddSchedule()
  const editSchedule = useEditSchedule()
  const deleteSchedule = useDeleteSchedule()

  return (
    <SchedulesScreen
      schedules={schedules}
      addSchedule={addSchedule}
      editSchedule={editSchedule}
      deleteSchedule={deleteSchedule}
    />
  )
}
