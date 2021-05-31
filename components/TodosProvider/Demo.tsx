import { todos } from 'database/demo'
import type { Todo } from 'database/types'
import { nanoid } from 'nanoid'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import create from 'zustand'
import type { TodosContext, TodosDispatchContext } from './Context'
import { DispatchProvider, StateProvider } from './Context'
import {
  addTodo,
  archiveTodos,
  completeTodo,
  deleteTodo,
  editTodo,
  incompleteTodo,
} from './utils'

const useStore = create<{ todos: TodosContext } & TodosDispatchContext>(
  (set) => ({
    todos,
    addTodo: async (data: Todo) => {
      const id = nanoid()
      set(({ todos }) => ({ todos: addTodo(todos, data, id) }))
      return { id }
    },
    editTodo: async (data, id) => {
      set(({ todos }) => ({ todos: editTodo(todos, data, id) }))
    },
    deleteTodo: async (id) => {
      set(({ todos }) => ({ todos: deleteTodo(todos, id) }))
    },
    completeTodo: async (id) => {
      set(({ todos }) => ({ todos: completeTodo(todos, id) }))
    },
    incompleteTodo: async (id) => {
      set(({ todos }) => ({ todos: incompleteTodo(todos, id) }))
    },
    archiveTodos: async () => {
      set(({ todos }) => ({ todos: archiveTodos(todos) }))
    },
  })
)

const Demo = ({ children }: { children: ReactNode }) => {
  const todos = useStore((state) => state.todos)
  const addTodo = useStore((state) => state.addTodo)
  const editTodo = useStore((state) => state.editTodo)
  const deleteTodo = useStore((state) => state.deleteTodo)
  const completeTodo = useStore((state) => state.completeTodo)
  const incompleteTodo = useStore((state) => state.incompleteTodo)
  const archiveTodos = useStore((state) => state.archiveTodos)

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

export default Demo
