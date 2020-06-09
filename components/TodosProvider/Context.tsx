import type { Todo } from 'database/types'
import { createContext, useContext } from 'react'

export type TodosContext = {
  todos: Todo[]
}

const error = new ReferenceError(
  `TodosProvider isn't in the tree, the context for useTodos is missing`
)
const context = createContext<TodosContext>({
  get todos() {
    throw error
    return []
  },
})

export const { Provider } = context

export const useTodos = () => {
  const { todos } = useContext(context)

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

  return { todos }
}
