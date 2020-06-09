import type { Todo } from 'database/types'
import { createContext, useContext } from 'react'

export type TodosContext = Todo[]

export type TodosDispatchContext = {
  completeTodo(id: string): void
  incompleteTodo(id: string): void
}

const error = new ReferenceError(
  `TodosProvider isn't in the tree, the context for useTodos is missing`
)
// @TODO implement thrower when attempting to read the default context
const context = createContext<TodosContext>([])
const dispatchContext = createContext<TodosDispatchContext>({
  get completeTodo() {
    throw error
    return () => {}
  },
  get incompleteTodo() {
    throw error
    return () => {}
  },
})

export const { Provider: StateProvider } = context
export const { Provider: DispatchProvider } = dispatchContext

export const useTodos = () => useContext(context)

export const useTodosDispatch = () => {
  const context = useContext(dispatchContext)

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

  return context
}
