import { schedules } from 'database/demo'
import type { Schedule } from 'database/types'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import create from 'zustand'

import { Provider } from './Context'
import type { SchedulesContext } from './Context'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import { sortByTime } from './utils'

const useStore = create<SchedulesContext>((set) => ({
  schedules,
  addSchedule: (schedule: Schedule) => {
    set((state) => ({
      schedules: [...state.schedules, schedule].sort(sortByTime),
    }))
    return Promise.resolve({ id: schedule.id })
  },
  editSchedule: (schedule: Schedule, id: string) =>
    set((state) => {
      const index = state.schedules.findIndex((schedule) => schedule.id === id)

      const newSchedules = replaceItemAtIndex(state.schedules, index, {
        ...state.schedules[index],
        start: schedule.start,
        duration: schedule.duration,
        end: schedule.end,
        repeat: schedule.repeat,
        enabled: schedule.enabled,
      })
      return { schedules: newSchedules.sort(sortByTime) }
    }),
  deleteSchedule: (id: string) =>
    set((state) => {
      const index = state.schedules.findIndex((schedule) => schedule.id === id)
      const newSchedules = removeItemAtIndex(state.schedules, index)
      return { schedules: newSchedules }
    }),
}))

const Demo = ({ children }: { children: ReactNode }) => {
  const schedules = useStore((state) => state.schedules)
  const addSchedule = useStore((state) => state.addSchedule)
  const editSchedule = useStore((state) => state.editSchedule)
  const deleteSchedule = useStore((state) => state.deleteSchedule)

  const context = useMemo(
    (): SchedulesContext => ({
      schedules,
      addSchedule,
      editSchedule,
      deleteSchedule,
    }),
    [schedules, addSchedule, editSchedule, deleteSchedule]
  )

  return <Provider value={context}>{children}</Provider>
}

export default Demo
