import database from 'database/localstorage'
import type { Schedule } from 'database/types'
import { useLogException } from 'hooks/analytics'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import create from 'zustand'
import { createAsset } from 'use-asset'
import { Provider } from './Context'
import type { SchedulesContext } from './Context'
import { useCallback } from 'react'

type SchedulesState = {
  schedules: Schedule[]
  setSchedules: (schedules: Schedule[]) => void
  setSchedulesInDatabase: (schedules) => Promise<void>
}

const useStore = create<SchedulesState>((set) => ({
  schedules: [],
  setSchedules: (schedules: Schedule[]) => set({ schedules }),
  setSchedulesInDatabase: async (schedules: Schedule[]) => {
    await database.setSchedules(schedules)
    return set({ schedules })
  },
}))

const asset = createAsset(
  async (setSchedules: SchedulesState['setSchedules']) => {
    //await new Promise((resolve) => setTimeout(() => resolve(), 3000))

    const schedules = await database.getSchedules()
    console.log({ schedules })

    setSchedules(schedules)
  }
)

const Localstorage = ({ children }: { children: ReactNode }) => {
  const logException = useLogException()
  const setSchedules = useStore((state) => state.setSchedules)
  asset.read(setSchedules)
  const schedules = useStore((state) => state.schedules)
  const setSchedulesInDatabase = useStore(
    (state) => state.setSchedulesInDatabase
  )

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = database.observeSchedules(
      (schedules) => setSchedules(schedules),
      (err) => logException(err)
    )

    return () => unsubscribe()
  }, [])

  const context = useMemo(
    (): SchedulesContext => ({
      schedules,
      setSchedules: setSchedulesInDatabase,
    }),
    [schedules]
  )

  return <Provider value={context}>{children}</Provider>
}

export default Localstorage
