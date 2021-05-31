import database from 'database/localstorage'
import type { Todo } from 'database/types'
import { useLogException } from 'hooks/analytics'
import { nanoid } from 'nanoid'
import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'
import { createAsset } from 'use-asset'
import create from 'zustand'
import type { TodosDispatchContext } from './Context'
import { DispatchProvider, StateProvider } from './Context'
import {
  addTodo,
  archiveTodos,
  completeTodo,
  deleteTodo,
  editTodo,
  incompleteTodo,
} from './utils'

const useStore = create<
  {
    todos: Todo[]
    setTodos: (todos: Todo[]) => void
  } & TodosDispatchContext
>((set, get) => ({
  todos: [],
  setTodos: (todos: Todo[]) => set({ todos }),
  addTodo: async (data) => {
    const id = nanoid()
    const { todos } = get()
    const updatedTodos = addTodo(todos, data, id)
    await database.setTodos(updatedTodos)
    set({ todos: updatedTodos })
    return { id }
  },
  editTodo: async (data, id) => {
    const { todos } = get()
    const updatedTodos = editTodo(todos, data, id)
    await database.setTodos(updatedTodos)
    set({ todos: updatedTodos })
  },
  deleteTodo: async (id) => {
    const { todos } = get()
    const updatedTodos = deleteTodo(todos, id)
    await database.setTodos(updatedTodos)
    set({ todos: updatedTodos })
  },
  completeTodo: async (id) => {
    const { todos } = get()
    const updatedTodos = completeTodo(todos, id)
    await database.setTodos(updatedTodos)
    set({ todos: updatedTodos })
  },
  incompleteTodo: async (id) => {
    const { todos } = get()
    const updatedTodos = incompleteTodo(todos, id)
    await database.setTodos(updatedTodos)
    set({ todos: updatedTodos })
  },
  archiveTodos: async () => {
    const { todos } = get()
    const updatedTodos = archiveTodos(todos)
    await database.setTodos(updatedTodos)
    set({ todos: updatedTodos })
  },
}))

const asset = createAsset(async (setTodos: (todos: Todo[]) => void) => {
  //await new Promise((resolve) => setTimeout(() => resolve(void 0), 3000))

  const todos = await database.getTodos()

  setTodos(todos)
})

const Localstorage = ({ children }: { children: ReactNode }) => {
  const logException = useLogException()
  const setTodosDirectly = useStore((state) => state.setTodos)
  // Only runs once, and ensures the view is suspended until the initial todos is fetched
  asset.read(setTodosDirectly)
  const todos = useStore((state) => state.todos)
  const addTodo = useStore((state) => state.addTodo)
  const editTodo = useStore((state) => state.editTodo)
  const deleteTodo = useStore((state) => state.deleteTodo)
  const completeTodo = useStore((state) => state.completeTodo)
  const incompleteTodo = useStore((state) => state.incompleteTodo)
  const archiveTodos = useStore((state) => state.archiveTodos)

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = database.observeTodos(
      (todos) => setTodosDirectly(todos),
      (err) => logException(err)
    )

    return () => unsubscribe()
  }, [])

  const context = useMemo(
    (): TodosDispatchContext => ({
      addTodo,
      editTodo,
      deleteTodo,
      completeTodo,
      incompleteTodo,
      archiveTodos,
    }),
    [addTodo, editTodo, deleteTodo, completeTodo, incompleteTodo, archiveTodos]
  )

  return (
    <DispatchProvider value={context}>
      <StateProvider value={todos}>{children}</StateProvider>
    </DispatchProvider>
  )
}

export default Localstorage
