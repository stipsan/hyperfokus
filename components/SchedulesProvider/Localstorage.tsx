import database from 'database/localstorage'
import type { Schedule } from 'database/types'
import { useLogException } from 'hooks/analytics'
import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'
import { createAsset } from 'use-asset'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import create from 'zustand'
import type { SchedulesContext } from './Context'
import { Provider } from './Context'
import { sortByTime } from './utils'

type SchedulesStore = SchedulesContext & {
  setSchedules: (schedules: Schedule[]) => void
}

const useStore = create<SchedulesStore>((set, get) => ({
  schedules: [],
  setSchedules: (schedules: Schedule[]) => set({ schedules }),
  addSchedule: async (schedule: Schedule) => {
    const { schedules } = get()
    const updatedSchedules = [...schedules, schedule].sort(sortByTime)
    await database.setSchedules(updatedSchedules)
    set({ schedules: updatedSchedules })
    return { id: schedule.id }
  },
  editSchedule: async (schedule: Schedule, id: string) => {
    const { schedules } = get()
    const index = schedules.findIndex((schedule) => schedule.id === id)

    const updatedSchedules = replaceItemAtIndex(schedules, index, {
      ...schedules[index],
      start: schedule.start,
      duration: schedule.duration,
      end: schedule.end,
      repeat: schedule.repeat,
      enabled: schedule.enabled,
    }).sort(sortByTime)
    await database.setSchedules(updatedSchedules)
    set({ schedules: updatedSchedules })
  },
  deleteSchedule: async (id: string) => {
    const { schedules } = get()
    const index = schedules.findIndex((schedule) => schedule.id === id)
    const updatedSchedules = removeItemAtIndex(schedules, index)
    await database.setSchedules(updatedSchedules)
    set({ schedules: updatedSchedules })
  },
}))

const asset = createAsset(
  async (setSchedules: SchedulesStore['setSchedules']) => {
    //await new Promise((resolve) => setTimeout(() => resolve(void 0), 3000))

    const schedules = await database.getSchedules()

    setSchedules(schedules)
  }
)

const Localstorage = ({ children }: { children: ReactNode }) => {
  const logException = useLogException()
  const setSchedules = useStore((state) => state.setSchedules)
  asset.read(setSchedules)
  const schedules = useStore((state) => state.schedules)
  const addSchedule = useStore((state) => state.addSchedule)
  const editSchedule = useStore((state) => state.editSchedule)
  const deleteSchedule = useStore((state) => state.deleteSchedule)

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
      addSchedule,
      editSchedule,
      deleteSchedule,
    }),
    [schedules, addSchedule, editSchedule, deleteSchedule]
  )

  return <Provider value={context}>{children}</Provider>
}

export default Localstorage
