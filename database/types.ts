export interface Repeat {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
  [key: string]: boolean
}

export interface Schedule {
  id: string
  after: Date
  duration: number
  enabled: boolean
  start: string
  end: string
  repeat: Repeat

  // Used in edit views for staged changes
  added?: boolean
  edited?: boolean
  deleted?: boolean
}

export type ScheduleInput = Schedule & {
  added: boolean
  edited: boolean
  deleted: boolean
}

export interface ScheduleDelta {
  id?: string
  after?: Date
  duration?: number
  enabled?: boolean
  start?: string
  end?: string
  repeat?: Repeat
}

export interface TodoDelta {
  id?: string
  description: string
  duration: number
  order?: number
  done?: boolean
  created?: Date
  modified?: Date
  completed?: Date
}

export interface Todo {
  id: string
  description: string
  duration: number
  order: number
  done: boolean
  created: Date
  modified: Date
  completed?: Date
}

// Base types
// @TODO rename to Slot? TimeSlot? TimePocket?
export type Time = {}
export type Task = {}

// Computed types (gone through the algorithm)
export type ComputedTime = {}
export type ComputedTask = {}

export interface DatabaseType {
  setSchedules(schedules: Schedule[]): Promise<void>
  getSchedules(): Promise<Schedule[]>
  observeSchedules(
    success: (schedules: Schedule[]) => void,
    failure: (reason: Error) => void
  ): () => void
  observeActivities(
    success: (activities: Todo[]) => void,
    failure: (reason: Error) => void
  ): () => void
  addActivity(activity: TodoDelta): Promise<Todo>
  editActivity(activityId: string, activity: TodoDelta): Promise<void>
  /** toggle an activity as completed */
  completeActivity(activityId: string): Promise<void>
  /** untoggle an activity as completed, puts it back on the board */
  incompleteActivity(activityId: string): Promise<void>
  /** Fetches truly finished activities */
  getCompletedActivities(): Promise<Todo[]>
  /** Fetches all activities that are completed and archives them so the schedule can be recreated */
  archiveCompletedActivities(): Promise<void>
  /** Reorder all activities, and make the selected activity either top 1 or bottom -1 */
  reorderActivities(activityId: string, ordering: number): Promise<void>
}
