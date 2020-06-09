import { todos } from 'database/demo'
import type { Todo } from 'database/types'
import { nanoid } from 'nanoid'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { atom, useRecoilState } from 'recoil'
import { replaceItemAtIndex } from 'utils/array'
import { DispatchProvider, StateProvider } from './Context'
import type { TodosDispatchContext } from './Context'

const todosState = atom<Todo[]>({
  key: 'demoTodos',
  default: todos,
})

export default ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useRecoilState(todosState)

  // @TODO trace if setTodos is referencial stable cross renders
  //       useMemo should only call its setter once, only StateProvider should trigger rerenders
  const context = useMemo(
    (): TodosDispatchContext => ({
      addTodo: async (data) => {
        const id = nanoid()

        await setTodos((todos) => {
          const todo = { ...data, id }

          if (todos.length < 1) {
            return [todo]
          }

          if (todo.order > 0) {
            const { order: bottom } = todos[todos.length - 1]
            return [...todos, { ...todo, order: bottom + 1 }]
          }

          const { order: top } = todos[0]
          return [{ ...todo, order: top - 1 }, ...todos]
        })

        return { id }
      },
      completeTodo: async (id) => {
        await setTodos((todos) => {
          const index = todos.findIndex((search) => search.id === id)
          return replaceItemAtIndex(todos, index, {
            ...todos[index],
            completed: new Date(),
          })
        })
      },
      incompleteTodo: async (id) => {
        await setTodos((todos) => {
          const index = todos.findIndex((search) => search.id === id)
          return replaceItemAtIndex(todos, index, {
            ...todos[index],
            completed: undefined,
            done: false,
          })
        })
      },
    }),
    [setTodos]
  )

  return (
    <DispatchProvider value={context}>
      <StateProvider value={todos}>{children}</StateProvider>
    </DispatchProvider>
  )
}