import database from 'database/localstorage'
import type { Todo } from 'database/types'
import { useLogException } from 'hooks/analytics'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { atom, selector, useRecoilState, useSetRecoilState } from 'recoil'
import { replaceItemAtIndex } from 'utils/array'
import { DispatchProvider, StateProvider } from './Context'
import type { TodosDispatchContext } from './Context'

const todosState = atom<Todo[]>({
  key: 'localstorageTodos',
  default: [],
})

const asyncTodosState = selector<Todo[]>({
  key: 'asyncLocalstorageTodos',
  get: async ({ get }) => {
    const cache = get(todosState)

    // It's only null when it should be fetched
    if (cache === null) {
      //await new Promise((resolve) => setTimeout(() => resolve(), 3000))
      return database.getTodos()
    }

    return cache
  },
  set: async ({ set }, todos: Todo[]) => {
    set(todosState, todos)
    await database.setTodos(todos)
  },
})

export default ({ children }: { children: ReactNode }) => {
  const logException = useLogException()
  const syncTodos = useSetRecoilState(todosState)
  const [todos, setTodos] = useRecoilState(asyncTodosState)

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = database.observeTodos(
      (todos) => syncTodos(todos),
      (err) => logException(err)
    )

    return () => unsubscribe()
  }, [])

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
