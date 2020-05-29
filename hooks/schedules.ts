import type { Schedule } from 'database/types'
import { getDatabase, useDatabase } from 'hooks/database'
import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil'
import { sortByHoursMinutesString } from 'utils/time'

export const schedulesState = atom<Schedule[]>({
  key: 'schedules',
  default: null,
})
const asyncSchedulesState = selector<Schedule[]>({
  key: 'asyncSchedulesState',
  get: async ({ get }) => {
    try {
      const cache = get(schedulesState)
      const database = await getDatabase({ get })
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
  set: ({ set }, newValue) => set(schedulesState, newValue),
})

// State setter and getter, useful when managing the schedules
export const useSchedules = (): [
  Schedule[],
  Dispatch<SetStateAction<Schedule[]>>
] => {
  const database = useDatabase()
  const [schedules, setSchedulesState] = useRecoilState(asyncSchedulesState)
  const setSchedules: Dispatch<SetStateAction<Schedule[]>> = (value) => {
    setSchedulesState((state) => {
      const schedules = typeof value === 'function' ? value(state) : value
      // Do the sorting on write instead of on read
      schedules.sort((a, b) => {
        let result = sortByHoursMinutesString(a.start, b.start)
        return result !== 0 ? result : sortByHoursMinutesString(a.end, b.end)
      })
      // Sync the new schedules with the db
      database.setSchedules(schedules)
      return schedules
    })
  }

  return [schedules, setSchedules]
}

// This hook ensures changes to the state after initial fetch is in sync
export const useSchedulesObserver = () => {
  const database = useDatabase()
  const setSchedules = useSetRecoilState(schedulesState)

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = database.observeSchedules(
      (schedules) => setSchedules(schedules),
      (err) => console.error(err)
    )

    return () => unsubscribe()
  }, [database])
}

const activeSchedules = selector({
  key: 'activeSchedules',
  get: ({ get }) =>
    get(asyncSchedulesState).filter((schedule) => schedule.enabled),
})

export const useActiveSchedules = (): Schedule[] => {
  const schedules = useRecoilValue(activeSchedules)

  return schedules
}
