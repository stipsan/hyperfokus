import type { Schedule } from 'database/types'
import { createContext, useContext, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { sortByHoursMinutesString } from 'utils/time'

export type SchedulesDispatchContext = {
  addSchedule(data: Schedule): Promise<{ id: string }>
  editSchedule(data: Schedule, id: string): void
  deleteSchedule(id: string): void
}

type SchedulesContext = {
  schedules: Schedule[]
} & SchedulesDispatchContext

const error = new ReferenceError(
  `SchedulesProvider isn't in the tree, the context for useSchedules is missing`
)
const context = createContext<SchedulesContext>({
  get schedules() {
    throw error
    return []
  },
  get addSchedule() {
    throw error
    return async () => ({ id: '' })
  },
  get editSchedule() {
    throw error
    return () => {}
  },
  get deleteSchedule() {
    throw error
    return () => {}
  },
})

export const { Provider } = context

export const useSchedules = () => {
  const { schedules, addSchedule, editSchedule, deleteSchedule } =
    useContext(context)

  /*
  const setSortedSchedules: Dispatch<SetStateAction<Schedule[]>> = (value) => {
    setSchedules((state) => {
      const schedules = typeof value === 'function' ? value(state) : value
      // Do the sorting on write instead of on read
      schedules.sort((a, b) => {
        let result = sortByHoursMinutesString(a.start, b.start)
        return result !== 0 ? result : sortByHoursMinutesString(a.end, b.end)
      })
      // @TODO should filter and sanitize data to ensure no properties are missing
      return schedules
    })
  }
  // */

  return { schedules, addSchedule, editSchedule, deleteSchedule }
}

export const useActiveSchedules = () => {
  const { schedules } = useSchedules()

  return useMemo<Schedule[]>(
    () => schedules.filter((schedule) => schedule.enabled),
    [schedules]
  )
}
