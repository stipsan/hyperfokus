import type { Schedule } from 'database/types'
import { useMemo } from 'react'

export type SchedulesContext = {
  schedules: Schedule[]
  addSchedule(data: Schedule): Promise<{ id: string }>
  editSchedule(data: Schedule, id: string): Promise<void>
  deleteSchedule(id: string): Promise<void>
}

export const useActiveSchedules = (schedules: Schedule[]) => {
  return useMemo<Schedule[]>(
    () => schedules.filter((schedule) => schedule.enabled),
    [schedules]
  )
}
