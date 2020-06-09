import type { Schedule } from 'database/types'
import { createContext, useContext, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { sortByHoursMinutesString } from 'utils/time'

export type SchedulesContext = {
  schedules: Schedule[]
  setSchedules: Dispatch<SetStateAction<Schedule[]>>
}

const error = new ReferenceError(
  `SchedulesProvider isn't in the tree, the context for useSchedules is missing`
)
const context = createContext<SchedulesContext>({
  get schedules() {
    throw error
    return []
  },
  get setSchedules() {
    throw error
    return () => {}
  },
})

export const { Provider } = context

export const useSchedules = () => {
  const { schedules, setSchedules } = useContext(context)

  const setSortedSchedules: Dispatch<SetStateAction<Schedule[]>> = (value) => {
    setSchedules((state) => {
      const schedules = typeof value === 'function' ? value(state) : value
      // Do the sorting on write instead of on read
      schedules.sort((a, b) => {
        let result = sortByHoursMinutesString(a.start, b.start)
        return result !== 0 ? result : sortByHoursMinutesString(a.end, b.end)
      })

      return schedules
    })
  }

  return { schedules, setSchedules: setSortedSchedules }
}

export const useActiveSchedules = () => {
  const { schedules } = useSchedules()

  return useMemo<Schedule[]>(
    () => schedules.filter((schedule) => schedule.enabled),
    [schedules]
  )
}
