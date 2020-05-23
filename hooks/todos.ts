import type { Todo } from 'database/types'
import { getDatabase, useDatabase } from 'hooks/database'
import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { atom, selector, useRecoilState, useSetRecoilState } from 'recoil'

export const todosState = atom({
  key: 'todos',
  default: null,
})
const asyncTodosState = selector({
  key: 'asyncTodosState',
  get: async ({ get }) => {
    try {
      const cache = get(todosState)
      const database = await getDatabase({ get })
      // It's only null when it should be fetched
      if (cache === null) {
        //await new Promise((resolve) => setTimeout(() => resolve(), 3000))
        return database.getTodos()
      }

      return cache
    } catch (err) {
      console.error('oh no wtf!', err)
    }
  },
  set: ({ set }, newValue) => set(todosState, newValue),
})

// State setter and getter, useful when managing the todos
export const useTodos = (): [Todo[], Dispatch<SetStateAction<Todo[]>>] => {
  const database = useDatabase()
  const [todos, setTodosState] = useRecoilState(asyncTodosState)
  const setTodos: Dispatch<SetStateAction<Todo[]>> = (value) => {
    setTodosState((state) => {
      const todos = typeof value === 'function' ? value(state) : value

      // Sync the new todos with the db
      database.setTodos(todos)
      return todos
    })
  }

  return [todos, setTodos]
}

// This hook ensures changes to the state after initial fetch is in sync
export const useTodosObserver = () => {
  const database = useDatabase()
  const setTodos = useSetRecoilState(todosState)

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = database.observeTodos(
      (todos) => setTodos(todos),
      (err) => console.error(err)
    )

    return () => unsubscribe()
  }, [database])
}
