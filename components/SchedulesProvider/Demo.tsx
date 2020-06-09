import { schedules } from 'database/demo'
import type { Schedule } from 'database/types'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { atom, useRecoilState } from 'recoil'
import { Provider } from './Context'
import type { SchedulesContext } from './Context'

const schedulesState = atom<Schedule[]>({
  key: 'demoSchedules',
  default: schedules,
})

export default ({ children }: { children: ReactNode }) => {
  const [schedules, setSchedules] = useRecoilState(schedulesState)

  const context = useMemo<SchedulesContext>(
    () => ({
      schedules,
      setSchedules,
    }),
    [schedules]
  )

  return <Provider value={context}>{children}</Provider>
}
