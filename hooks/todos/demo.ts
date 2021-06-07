import { todos } from 'database/demo'
import type { Todo } from 'database/types'
import { nanoid } from 'nanoid'
import { createAsset } from "use-asset"
import create from 'zustand'
import type {
  AddTodo, ArchiveTodos, CompleteTodo, DeleteTodo, EditTodo, IncompleteTodo, Todos
} from './types'
import {
  addTodo, archiveTodos, completeTodo,
  deleteTodo,
  editTodo,
  incompleteTodo,
  sanitize
} from './utils'

type StoreState = {
  todos: Todos
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
export type TodosResource = typeof todosResource

const useStore = create<StoreState>((set) => ({
  todos,
  addTodo: async (data: Todo) => {
    const id = nanoid()
    set(({ todos }) => ({ todos: addTodo(todos, sanitize({...data, id}) as Todo) }))
    return { id }
  },
  editTodo: async (data, id) => {
    todosResource.clear(id)
    set(({ todos }) => ({ todos: editTodo(todos, sanitize({...data, modified: new Date() }) as Todo, id) }))
  },
  deleteTodo: async (id) => {
    set(({ todos }) => ({ todos: deleteTodo(todos, id) }))
  },
  completeTodo: async (id) => {
    todosResource.clear(id)
    set(({ todos }) => ({ todos: completeTodo(todos, id) }))
  },
  incompleteTodo: async (id) => {
    todosResource.clear(id)
    set(({ todos }) => ({ todos: incompleteTodo(todos, id) }))
  },
  archiveTodos: async () => {
    set(({ todos }) => ({ todos: archiveTodos(todos) }))
  },
}))



const selectTodos = (state: StoreState) => state.todos.filter(todo => !todo.done)
export const useTodos = () => useStore(selectTodos)

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