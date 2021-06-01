import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import type { Todo } from 'database/types'

export function addTodo(todos: Todo[], todo: Todo): Todo[] {

  if (todos.length < 1) {
    return [todo]
  }

  if (todo.order > 0) {
    const { order: bottom } = todos[todos.length - 1]
    return [...todos, { ...todo, order: bottom + 1 }]
  }

  const { order: top } = todos[0]
  return [{ ...todo, order: top - 1 }, ...todos]
}

export function editTodo(todos: Todo[], data: Todo, id: string): Todo[] {
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
    return [...removeItemAtIndex(todos, index), { ...todo, order: bottom + 1 }]
  } else if (todos[index].order !== data.order && data.order === -1) {
    const { order: top } = todos[0]
    return [{ ...todo, order: top - 1 }, ...removeItemAtIndex(todos, index)]
  }

  return replaceItemAtIndex(todos, index, todo)
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  const index = todos.findIndex((search) => search.id === id)
  return removeItemAtIndex(todos, index)
}

export function completeTodo(todos: Todo[], id: string): Todo[] {
  const index = todos.findIndex((search) => search.id === id)
  return replaceItemAtIndex(todos, index, {
    ...todos[index],
    completed: new Date(),
  })
}

export function incompleteTodo(todos: Todo[], id: string): Todo[] {
  const index = todos.findIndex((search) => search.id === id)
  return replaceItemAtIndex(todos, index, {
    ...todos[index],
    completed: undefined,
    done: false,
  })
}

export function archiveTodos(todos: Todo[]): Todo[] {
  return todos.map((todo) => ({
    ...todo,
    done: todo.done || !!todo.completed,
  }))
}
