import Button from 'components/Button'
import type { Schedule } from 'database/types'
import type { User } from 'firebase/app'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import FirebaseAuthCheck from 'components/FirebaseAuthCheck'
import {
  AuthCheck,
  useFirestore,
  useFirestoreCollectionData,
  useUser,
} from 'reactfire'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import type { SchedulesContext } from './Context'
import { Provider } from './Context'
import { sortByTime } from './utils'

type ScheduleDoc = {
  rules: Schedule[]
}

/*
const sanitize = (schedule: Schedule) => {
  const { rules } = schedule
      rules.forEach((rule) => {
        // @TODO filter and provide sound default values, remove rules that are too broken to fix
        const { after, duration, enabled, end, repeat, start, id } = rule
        
      })
}
// */

const SchedulesProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser<User>()
  const firestore = useFirestore()
  const schedulesRef = firestore
    .collection('schedules')
    .where('author', '==', user.uid)
  const schedulesDoc = useFirestoreCollectionData<ScheduleDoc>(schedulesRef)

  // TODO refactor this, it's leftover from the old db structure that were nested
  // instead of a "rules" super property, each "rule" should be an item in the "schedules" collection
  const setLegacySchedules = useCallback(
    async (schedules: ScheduleDoc['rules']) => {
      const schedulesSnapshots = await schedulesRef.get()
      let schedulesId = ''
      schedulesSnapshots.forEach((snapshot) => {
        schedulesId = snapshot.id
      })
      if (schedulesId === '') {
        const newScheduleRef = await firestore
          .collection('schedules')
          .add({ author: user.uid })
        schedulesId = newScheduleRef.id
      }

      // Ensure there's no duplicates
      // @TODO filter and sanitize data
      const usedIds = new Set()
      const rules = schedules.filter((schedule) => {
        if (usedIds.has(schedule.id)) {
          return false
        }
        usedIds.add(schedule.id)
        return true
      })

      await firestore.collection('schedules').doc(schedulesId).update({ rules })
    },
    [schedulesRef, firestore, user]
  )

  const context = useMemo(
    (): SchedulesContext => ({
      schedules: schedulesDoc?.[0]?.rules ?? [],
      addSchedule: async (schedule: Schedule) => {
        const schedules = schedulesDoc?.[0]?.rules ?? []
        const updatedSchedules = [...schedules, schedule].sort(sortByTime)
        await setLegacySchedules(updatedSchedules)
        return { id: schedule.id }
      },
      editSchedule: async (schedule: Schedule, id: string) => {
        const schedules = schedulesDoc?.[0]?.rules ?? []
        const index = schedules.findIndex((schedule) => schedule.id === id)

        const updatedSchedules = replaceItemAtIndex(schedules, index, {
          ...schedules[index],
          start: schedule.start,
          duration: schedule.duration,
          end: schedule.end,
          repeat: schedule.repeat,
          enabled: schedule.enabled,
        }).sort(sortByTime)
        await setLegacySchedules(updatedSchedules)
      },
      deleteSchedule: async (id: string) => {
        const schedules = schedulesDoc?.[0]?.rules ?? []
        const index = schedules.findIndex((schedule) => schedule.id === id)
        const updatedSchedules = removeItemAtIndex(schedules, index)
        await setLegacySchedules(updatedSchedules)
      },
    }),
    [schedulesDoc, setLegacySchedules]
  )

  return <Provider value={context}>{children}</Provider>
}

const Firebase = ({ children }: { children: ReactNode }) => (
  <FirebaseAuthCheck>
    <SchedulesProvider>{children}</SchedulesProvider>
  </FirebaseAuthCheck>
)

export default Firebase
