import { schedules } from 'database/demo'
import { nanoid } from 'nanoid'
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
  addSchedule: AddSchedule
  editSchedule: EditSchedule
  deleteSchedule: DeleteSchedule
}

const useStore = create<StoreState>((set) => ({
  schedules,
  addSchedule: async (schedule) => {
    const id = nanoid()
    set(({ schedules }) => ({
      schedules: addSchedule(schedules, { ...schedule, id }),
    }))
    return { id }
  },
  editSchedule: async (schedule, id) =>
    set(({ schedules }) => ({
      schedules: editSchedule(schedules, schedule, id),
    })),
  deleteSchedule: async (id) =>
    set(({ schedules }) => ({
      schedules: deleteSchedule(schedules, id),
    })),
}))

const selectSchedules = (state: StoreState) => state.schedules
export const useSchedules = () => useStore(selectSchedules)

const selectAddSchedule = (state: StoreState) => state.addSchedule
export const useAddSchedule = () => useStore(selectAddSchedule)

const selectEditSchedule = (state: StoreState) => state.editSchedule
export const useEditSchedule = () => useStore(selectEditSchedule)

const selectDeleteSchedule = (state: StoreState) => state.deleteSchedule
export const useDeleteSchedule = () => useStore(selectDeleteSchedule)
