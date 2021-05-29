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

export interface Tag {
  id: string
  name: string
  color: string
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
  tags?: string[]
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
  tags?: string[]
}

export interface DatabaseType {
  setSchedules(schedules: Schedule[]): Promise<unknown>
  getSchedules(): Promise<Schedule[]>
  observeSchedules(
    success: (schedules: Schedule[]) => void,
    failure: (reason: Error) => void
  ): () => void
  observeTodos(
    success: (todos: Todo[]) => void,
    failure: (reason: Error) => void
  ): () => void
  setTodos(todos: Todo[]): Promise<void>
  getTodos(): Promise<Todo[]>
}
