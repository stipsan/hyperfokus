import database from 'database/localstorage'
import type { Todo } from 'database/types'
import { useLogException } from 'hooks/analytics'
import { nanoid } from 'nanoid'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { atom, selector, useRecoilState, useSetRecoilState } from 'recoil'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
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
      editTodo: async (data, id) => {
        await setTodos((todos) => {
          const index = todos.findIndex((search) => search.id === id)
          const todo = {
            ...todos[index],
            ...data,
          }

          if (todos.length < 1) {
            return [todo]
          }

          if (todos[index].order !== data.order && data.order === 1) {
            const { order: bottom } = todos[todos.length - 1]
            return [
              ...removeItemAtIndex(todos, index),
              { ...todo, order: bottom + 1 },
            ]
          } else if (todos[index].order !== data.order && data.order === -1) {
            const { order: top } = todos[0]
            return [
              { ...todo, order: top - 1 },
              ...removeItemAtIndex(todos, index),
            ]
          }

          return replaceItemAtIndex(todos, index, todo)
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
