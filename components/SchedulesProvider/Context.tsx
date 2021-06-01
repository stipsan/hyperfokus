import type { Schedule } from 'database/types'
import { useMemo } from 'react'

export const useActiveSchedules = (schedules: Schedule[]) => {
  return useMemo<Schedule[]>(
    () => schedules.filter((schedule) => schedule.enabled),
    [schedules]
  )
}
