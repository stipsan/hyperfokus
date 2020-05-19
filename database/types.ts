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

export interface DatabaseType {
  setSchedules(schedules: Schedule[]): Promise<void>
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
  addTodo(todo: TodoDelta): Promise<Todo>
  editTodo(todoId: string, todo: TodoDelta): Promise<void>
  /** toggle an todo as completed */
  completeTodo(todoId: string): Promise<void>
  /** untoggle an todo as completed, puts it back on the board */
  incompleteTodo(todoId: string): Promise<void>
  /** Fetches truly finished todos */
  getCompletedTodos(): Promise<Todo[]>
  /** Fetches all todos that are completed and archives them so the schedule can be recreated */
  archiveCompletedTodos(): Promise<void>
  /** Reorder all todos, and make the selected todo either top 1 or bottom -1 */
  reorderTodos(todoId: string, ordering: number): Promise<void>
}
