import type { Todo } from 'database/types'
import { createContext, useContext } from 'react'

export type TodosContext = Todo[]

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
const context = createContext<TodosContext>([])
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

export const { Provider: StateProvider } = context
export const { Provider: DispatchProvider } = dispatchContext

export const useTodos = () => useContext(context)

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
