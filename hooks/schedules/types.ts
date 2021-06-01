import type { Schedule } from 'database/types'

export type Schedules = Schedule[]
export type AddSchedule = (data: Schedule) => Promise<{ id: string }>
export type EditSchedule = (data: Schedule, id: string) => Promise<void>
export type DeleteSchedule = (id: string) => Promise<void>