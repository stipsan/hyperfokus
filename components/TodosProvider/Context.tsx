import type { Todo } from 'database/types'
import { createContext, useContext } from 'react'

export type TodosContext = Todo[]

export type TodosDispatchContext = {
  addTodo(data: Todo): Promise<{ id: string }>
  editTodo(data: Todo, id: string): void
  deleteTodo(id: string): void
  completeTodo(id: string): void
  incompleteTodo(id: string): void
  archiveTodos(): void
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
    return () => {}
  },
  get deleteTodo() {
    throw error
    return () => {}
  },
  get completeTodo() {
    throw error
    return () => {}
  },
  get incompleteTodo() {
    throw error
    return () => {}
  },
  get archiveTodos() {
    throw error
    return () => {}
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

  /*
  const setSortedTodos: Dispatch<SetStateAction<Todo[]>> = (value) => {
    setTodos((state) => {
      const todos = typeof value === 'function' ? value(state) : value
      // Do the sorting on write instead of on read
      todos.sort((a, b) => {
        let result = sortByHoursMinutesString(a.start, b.start)
        return result !== 0 ? result : sortByHoursMinutesString(a.end, b.end)
      })

      return todos
    })
  }
  // */

  return { ...context, addTodo: addTodoSanitized, editTodo: editTodoSanitized }
}
