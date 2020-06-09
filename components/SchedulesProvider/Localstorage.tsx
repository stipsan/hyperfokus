import database from 'database/localstorage'
import type { Schedule } from 'database/types'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { atom, selector, useRecoilState, useSetRecoilState } from 'recoil'
import { Provider } from './Context'
import type { SchedulesContext } from './Context'

const schedulesState = atom<Schedule[]>({
  key: 'localstorageSchedules',
  default: null,
})

const asyncSchedulesState = selector<Schedule[]>({
  key: 'asyncLocalstorageSchedules',
  get: async ({ get }) => {
    try {
      const cache = get(schedulesState)

      // It's only null when it should be fetched
      if (cache === null) {
        //await new Promise((resolve) => setTimeout(() => resolve(), 3000))
        return database.getSchedules()
      }

      return cache
    } catch (err) {
      console.error('oh no wtf!', err)
    }
  },
  set: async ({ set }, schedules: Schedule[]) => {
    set(schedulesState, schedules)
    await database.setSchedules(schedules)
  },
})

export default ({ children }: { children: ReactNode }) => {
  const syncSchedules = useSetRecoilState(schedulesState)
  const [schedules, setSchedules] = useRecoilState(asyncSchedulesState)

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = database.observeSchedules(
      (schedules) => syncSchedules(schedules),
      (err) => console.error(err)
    )

    return () => unsubscribe()
  }, [database])

  const context = useMemo(
    (): SchedulesContext => ({
      schedules,
      setSchedules,
    }),
    [schedules]
  )

  return <Provider value={context}>{children}</Provider>
}
