import type { Todo } from 'database/types'
import { createContext, useContext } from 'react'

export type TodosContext = Todo[]

export type addTodo = (data: Todo) => Promise<{ id: string }>
export type editTodo = (data: Todo, id: string) => Promise<void>
export type deleteTodo = (id: string) => Promise<void>
export type completeTodo = (id: string) => Promise<void>
export type incompleteTodo = (id: string) => Promise<void>
export type archiveTodos = () => Promise<void>

export type TodosDispatchContext = {
  addTodo(data: Todo): Promise<{ id: string }>
  editTodo(data: Todo, id: string): Promise<void>
  deleteTodo(id: string): Promise<void>
  completeTodo(id: string): Promise<void>
  incompleteTodo(id: string): Promise<void>
  archiveTodos(): Promise<void>
}

const error = new ReferenceError(
  `TodosProvider isn't in the tree, the context for useTodos is missing`
)
// @TODO implement thrower when attempting to read the default context
const dispatchContext = createContext<TodosDispatchContext>({
  get addTodo() {
    throw error
    return async () => ({ id: '' })
  },
  get editTodo() {
    throw error
    return async () => {}
  },
  get deleteTodo() {
    throw error
    return async () => {}
  },
  get completeTodo() {
    throw error
    return async () => {}
  },
  get incompleteTodo() {
    throw error
    return async () => {}
  },
  get archiveTodos() {
    throw error
    return async () => {}
  },
})

export const useTodosDispatch = () => {
  const { addTodo, editTodo, ...context } = useContext(dispatchContext)

  const addTodoSanitized = ({ description, ...todo }: Todo) =>
    addTodo({ ...todo, description: description.substring(0, 2048) })

  const editTodoSanitized = ({ description, ...todo }: Todo, id: string) =>
    editTodo(
      {
        ...todo,
        description: description.substring(0, 2048),
        modified: new Date(),
      },
      id
    )

  return { ...context, addTodo: addTodoSanitized, editTodo: editTodoSanitized }
}
