import FirebaseAuthCheck from 'components/FirebaseAuthCheck'
import { useSchedules } from 'hooks/schedules/firebase'
import SchedulesScreen from 'components/screens/schedules'

export default function FirebaseSchedulesScreen() {
  const [schedules, { addSchedule, editSchedule, deleteSchedule }] =
    useSchedules()

  return (
    <FirebaseAuthCheck>
      <SchedulesScreen
        schedules={schedules}
        addSchedule={addSchedule}
        editSchedule={editSchedule}
        deleteSchedule={deleteSchedule}
      />
    </FirebaseAuthCheck>
  )
}
