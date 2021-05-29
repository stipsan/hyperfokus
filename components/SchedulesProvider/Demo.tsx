import { schedules } from 'database/demo'
import type { Schedule } from 'database/types'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import create from 'zustand'

import { Provider } from './Context'
import type { SchedulesContext } from './Context'

type SchedulesState = {
  schedules: Schedule[]
  setSchedules: (schedules: Schedule[]) => void
}

const useStore = create<SchedulesState>((set) => ({
  schedules,
  setSchedules: (schedules: Schedule[]) => set({ schedules }),
}))

const Demo = ({ children }: { children: ReactNode }) => {
  const schedules = useStore((state) => state.schedules)
  const setSchedules = useStore((state) => state.setSchedules)

  const context = useMemo(
    (): SchedulesContext => ({
      schedules,
      setSchedules,
    }),
    [schedules]
  )

  return <Provider value={context}>{children}</Provider>
}

export default Demo
