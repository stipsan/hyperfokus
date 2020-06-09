import { todos } from 'database/demo'
import type { Todo } from 'database/types'
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
      completeTodo: (id) => {
        setTodos((todos) => {
          const index = todos.findIndex((search) => search.id === id)
          return replaceItemAtIndex(todos, index, {
            ...todos[index],
            completed: new Date(),
          })
        })
      },
      incompleteTodo: (id) => {
        setTodos((todos) => {
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
