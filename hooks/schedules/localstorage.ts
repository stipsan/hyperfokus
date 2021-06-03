import database from 'database/localstorage'
import { useLogException } from 'hooks/analytics'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { createAsset } from 'use-asset'
import create from 'zustand'
import type {
  AddSchedule,
  DeleteSchedule,
  EditSchedule,
  Schedules,
} from './types'
import { addSchedule, deleteSchedule, editSchedule } from './utils'

type StoreState = {
  schedules: Schedules
  setSchedules: (schedules: Schedules) => void
  addSchedule: AddSchedule
  editSchedule: EditSchedule
  deleteSchedule: DeleteSchedule
}

const useStore = create<StoreState>((set, get) => ({
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
  addSchedule: async (schedule) => {
    const id = nanoid()
    const { schedules } = get()
    const updatedSchedules = addSchedule(schedules, { ...schedule, id })
    await database.setSchedules(updatedSchedules)
    set({ schedules: updatedSchedules })
    return { id }
  },
  editSchedule: async (schedule, id) => {
    const { schedules } = get()
    const updatedSchedules = editSchedule(schedules, schedule, id)
    await database.setSchedules(updatedSchedules)
    set({ schedules: updatedSchedules })
  },
  deleteSchedule: async (id) => {
    const { schedules } = get()
    const updatedSchedules = deleteSchedule(schedules, id)
    await database.setSchedules(updatedSchedules)
    set({ schedules: updatedSchedules })
  },
}))

// TODO for later https://github.com/facebook/react/pull/19696
const asset = createAsset(
  async (setSchedules: (schedules: Schedules) => void) => {
    //await new Promise((resolve) => setTimeout(() => resolve(void 0), 3000))

    const schedules = await database.getSchedules()

    unstable_batchedUpdates(() => setSchedules(schedules))
  }
)


const selectSetSchedules = (state: StoreState) => state.setSchedules
const selectSchedules = (state: StoreState) => state.schedules
export const useSchedules = () => {
  const logException = useLogException()
  const setSchedules = useStore(selectSetSchedules)
  // Only runs once, and ensures the view is suspended until the initial schedules are fetched
  asset.read(setSchedules)
  const schedules = useStore(selectSchedules)

  // Sync the state in case it's been updated in other tabs
  useEffect(() => {
    const unsubscribe = database.observeSchedules(
      (schedules) => unstable_batchedUpdates(() => setSchedules(schedules)),
      (err) => logException(err)
    )

    return () => unsubscribe()
  }, [setSchedules, logException])

  return schedules
}

const selectAddSchedule = (state: StoreState) => state.addSchedule
export const useAddSchedule = () => useStore(selectAddSchedule)

const selectEditSchedule = (state: StoreState) => state.editSchedule
export const useEditSchedule = () => useStore(selectEditSchedule)

const selectDeleteSchedule = (state: StoreState) => state.deleteSchedule
export const useDeleteSchedule = () => useStore(selectDeleteSchedule)
