import database from 'database/localstorage'
import { useLogException } from 'hooks/analytics'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { createAsset } from 'use-asset'
import create from 'zustand'
import type {
  AddTodo,
  ArchiveTodos,
  CompleteTodo,
  DeleteTodo,
  EditTodo,
  IncompleteTodo,
  Todos,
} from './types'
import {
  addTodo,
  archiveTodos,
  completeTodo,
  deleteTodo,
  editTodo,
  incompleteTodo,
} from './utils'

type StoreState = {
  todos: Todos
  setTodos: (todos: Todos) => void
  addTodo: AddTodo
  editTodo: EditTodo
  deleteTodo: DeleteTodo
  completeTodo: CompleteTodo
  incompleteTodo: IncompleteTodo
  archiveTodos: ArchiveTodos
}

const useStore = create<StoreState>((set, get) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: async (data) => {
    const id = nanoid()
    const { todos } = get()
    const updatedTodos = addTodo(todos, { ...data, id })
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

const asset = createAsset(async (setTodos: (todos: Todos) => void) => {
  //await new Promise((resolve) => setTimeout(() => resolve(void 0), 3000))

  const todos = await database.getTodos()

  unstable_batchedUpdates(() => setTodos(todos))
})

const selectSetTodos = (state: StoreState) => state.setTodos
const selectTodos = (state: StoreState) => state.todos
export const useTodos = () => {
  const logException = useLogException()
  const setTodos = useStore(selectSetTodos)
  // Only runs once, and ensures the view is suspended until the initial todos are fetched
  asset.read(setTodos)
  const todos = useStore(selectTodos)

  // Sync the state in case it's been updated in other tabs
  useEffect(() => {
    const unsubscribe = database.observeTodos(
      (todos) => unstable_batchedUpdates(() => setTodos(todos)),
      (err) => logException(err)
    )

    return () => unsubscribe()
  }, [setTodos, logException])

  return todos
}

const selectAddTodo = (state: StoreState) => state.addTodo
export const useAddTodo = () => useStore(selectAddTodo)

const selectEditTodo = (state: StoreState) => state.editTodo
export const useEditTodo = () => useStore(selectEditTodo)

const selectDeleteTodo = (state: StoreState) => state.deleteTodo
export const useDeleteTodo = () => useStore(selectDeleteTodo)

const selectCompleteTodo = (state: StoreState) => state.completeTodo
export const useCompleteTodo = () => useStore(selectCompleteTodo)

const selectIncompleteTodo = (state: StoreState) => state.incompleteTodo
export const useIncompleteTodo = () => useStore(selectIncompleteTodo)

const selectArchiveTodos = (state: StoreState) => state.archiveTodos
export const useArchiveTodos = () => useStore(selectArchiveTodos)
