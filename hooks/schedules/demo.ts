import { schedules } from 'database/demo'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import create from 'zustand'
import type {
  Schedules,
  AddSchedule,
  EditSchedule,
  DeleteSchedule,
} from './types'
import { sortByTime } from './utils'

type StoreState = {
  schedules: Schedules
  addSchedule: AddSchedule
  editSchedule: EditSchedule
  deleteSchedule: DeleteSchedule
}

const useStore = create<StoreState>((set) => ({
  schedules,
  addSchedule: async (schedule) => {
    set((state) => ({
      schedules: [...state.schedules, schedule].sort(sortByTime),
    }))
    return { id: schedule.id }
  },
  editSchedule: async (schedule, id) =>
    set((state) => {
      const index = state.schedules.findIndex((schedule) => schedule.id === id)

      const newSchedules = replaceItemAtIndex(state.schedules, index, {
        ...state.schedules[index],
        start: schedule.start,
        duration: schedule.duration,
        end: schedule.end,
        repeat: schedule.repeat,
        enabled: schedule.enabled,
      })
      return { schedules: newSchedules.sort(sortByTime) }
    }),
  deleteSchedule: async (id) =>
    set((state) => {
      const index = state.schedules.findIndex((schedule) => schedule.id === id)
      const newSchedules = removeItemAtIndex(state.schedules, index)
      return { schedules: newSchedules }
    }),
}))

const selectSchedules = (state: StoreState) => state.schedules
export const useSchedules = () => useStore(selectSchedules)

const selectAddSchedule=(state: StoreState) => state.addSchedule
export const useAddSchedule = () => useStore(selectAddSchedule)

const selectEditSchedule =(state: StoreState) => state.editSchedule
export const useEditSchedule = () => useStore(selectEditSchedule)

const selectDeleteSchedule = (state: StoreState) => state.deleteSchedule
export const useDeleteSchedule = () => useStore(selectDeleteSchedule)
