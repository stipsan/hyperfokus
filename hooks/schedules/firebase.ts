import type { User } from 'firebase/app'
import { nanoid } from 'nanoid'
import { useCallback, useMemo } from 'react'
import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire'
import type {
  AddSchedule,
  DeleteSchedule,
  EditSchedule,
  Schedules,
} from './types'
import { addSchedule, deleteSchedule, editSchedule } from './utils'

type ScheduleDoc = {
  rules: Schedules
}

type Actions = {
  addSchedule: AddSchedule
  editSchedule: EditSchedule
  deleteSchedule: DeleteSchedule
}

export function useSchedules(): [Schedules, Actions] {
  const user = useUser<User>()
  const firestore = useFirestore()
  const schedulesRef = firestore
    .collection('schedules')
    .where('author', '==', user.uid)
  const schedulesDoc = useFirestoreCollectionData<ScheduleDoc>(schedulesRef)
  const schedules = useMemo<Schedules>(() => schedulesDoc?.[0]?.rules ?? [],[schedulesDoc])

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

  const actions = useMemo<Actions>(
    () => ({
      addSchedule: async (schedule) => {
        const id = nanoid()
        const updatedSchedules = addSchedule(schedules, { ...schedule, id })
        await setLegacySchedules(updatedSchedules)
        return { id }
      },
      editSchedule: async (schedule, id) => {
        const updatedSchedules = editSchedule(schedules, schedule, id)
        await setLegacySchedules(updatedSchedules)
      },
      deleteSchedule: async (id) => {
        const updatedSchedules = deleteSchedule(schedules, id)
        await setLegacySchedules(updatedSchedules)
      },
    }),
    [setLegacySchedules, schedules]
  )

  return [schedules, actions]
}
