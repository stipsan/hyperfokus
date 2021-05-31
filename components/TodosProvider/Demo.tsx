import { todos } from 'database/demo'
import type { Todo } from 'database/types'
import { nanoid } from 'nanoid'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import create from 'zustand'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import { DispatchProvider, StateProvider } from './Context'
import type { TodosDispatchContext, TodosContext } from './Context'

const useStore = create<{ todos: TodosContext } & TodosDispatchContext>(
  (set) => ({
    todos,
    addTodo: async (data: Todo) => {
      const id = nanoid()

      set(({ todos }) => {
        const todo = { ...data, id }

        if (todos.length < 1) {
          return { todos: [todo] }
        }

        if (todo.order > 0) {
          const { order: bottom } = todos[todos.length - 1]
          return { todos: [...todos, { ...todo, order: bottom + 1 }] }
        }

        const { order: top } = todos[0]
        return { todos: [{ ...todo, order: top - 1 }, ...todos] }
      })
      return { id }
    },
    editTodo: async (data, id) => {
      set(({ todos }) => {
        const index = todos.findIndex((search) => search.id === id)
        const todo = {
          ...todos[index],
          ...data,
        }

        if (todos.length < 1) {
          return { todos: [todo] }
        }

        if (todos[index].order !== data.order && data.order === 1) {
          const { order: bottom } = todos[todos.length - 1]
          return {
            todos: [
              ...removeItemAtIndex(todos, index),
              { ...todo, order: bottom + 1 },
            ],
          }
        } else if (todos[index].order !== data.order && data.order === -1) {
          const { order: top } = todos[0]
          return {
            todos: [
              { ...todo, order: top - 1 },
              ...removeItemAtIndex(todos, index),
            ],
          }
        }

        return { todos: replaceItemAtIndex(todos, index, todo) }
      })
    },
    deleteTodo: async (id) => {
      set(({ todos }) => {
        const index = todos.findIndex((search) => search.id === id)
        return { todos: removeItemAtIndex(todos, index) }
      })
    },
    completeTodo: async (id) => {
      set(({ todos }) => {
        const index = todos.findIndex((search) => search.id === id)
        return {
          todos: replaceItemAtIndex(todos, index, {
            ...todos[index],
            completed: new Date(),
          }),
        }
      })
    },
    incompleteTodo: async (id) => {
      set(({ todos }) => {
        const index = todos.findIndex((search) => search.id === id)
        return {
          todos: replaceItemAtIndex(todos, index, {
            ...todos[index],
            completed: undefined,
            done: false,
          }),
        }
      })
    },
    archiveTodos: async () => {
      set(({ todos }) => ({
        todos: todos.map((todo) => ({
          ...todo,
          done: todo.done || !!todo.completed,
        })),
      }))
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
