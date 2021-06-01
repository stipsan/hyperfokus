import {
  useSchedules,
  useAddSchedule,
  useEditSchedule,
  useDeleteSchedule,
} from 'hooks/schedules/demo'
import SchedulesScreen from 'components/screens/schedules'

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
