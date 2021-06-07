import database from 'database/localstorage'
import { Todo } from 'database/types'
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
  sanitize,
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


export const todosResource = createAsset(async (id) => {
  const {todos} = useStore.getState()

  return todos.find((todo) => todo.id === id)
})

const useStore = create<StoreState>((set, get) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: async (data) => {
    const id = nanoid()
    const { todos } = get()
    const updatedTodos = addTodo(todos, sanitize({ ...data, id }) as Todo)
    await database.setTodos(updatedTodos)
    set({ todos: updatedTodos })
    return { id }
  },
  editTodo: async (data, id) => {
    const { todos } = get()
    const updatedTodos = editTodo(todos, sanitize({...data, modified: new Date()}) as Todo, id)
    await database.setTodos(updatedTodos)
    todosResource.clear(id)
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
    todosResource.clear(id)
    set({ todos: updatedTodos })
  },
  incompleteTodo: async (id) => {
    const { todos } = get()
    const updatedTodos = incompleteTodo(todos, id)
    await database.setTodos(updatedTodos)
    todosResource.clear(id)
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

  unstable_batchedUpdates(() => {
    // @ts-expect-error
    todosResource.clear()
    setTodos(todos)
  })
})

const selectSetTodos = (state: StoreState) => state.setTodos
const selectTodos = (state: StoreState) => state.todos.filter(todo => !todo.done)
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
