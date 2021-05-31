import type { Schedule } from 'database/types'
import { createContext, useContext, useMemo } from 'react'

export type SchedulesContext = {
  schedules: Schedule[]
  addSchedule(data: Schedule): Promise<{ id: string }>
  editSchedule(data: Schedule, id: string): Promise<void>
  deleteSchedule(id: string): Promise<void>
}

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
    return async () => {}
  },
  get deleteSchedule() {
    throw error
    return async () => {}
  },
})

export const { Provider } = context

// TODO rewrite to separate contexts for actions and state (one for each, as actions only change once)
export const useSchedules = () => {
  const { schedules, addSchedule, editSchedule, deleteSchedule } =
    useContext(context)

  return { schedules, addSchedule, editSchedule, deleteSchedule }
}

export const useActiveSchedules = () => {
  const { schedules } = useSchedules()

  return useMemo<Schedule[]>(
    () => schedules.filter((schedule) => schedule.enabled),
    [schedules]
  )
}
