import type { Todo } from 'database/types'

export type Todos = Todo[]
export type AddTodo = (data: Todo) => Promise<{ id: string }>
export type EditTodo = (data: Todo, id: string) => Promise<void>
export type DeleteTodo = (id: string) => Promise<void>
export type CompleteTodo = (id: string) => Promise<void>
export type IncompleteTodo = (id: string) => Promise<void>
export type ArchiveTodos = () => Promise<void>
