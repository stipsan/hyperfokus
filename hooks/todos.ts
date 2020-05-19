import type { Todo } from 'database/types'
import { useDatabase } from 'hooks/database'
import { useEffect } from 'react'

// Get a todos list using suspense, useful to put in useState or similar
let promise = null
let todos: false | Todo[] = false
export const useGetTodos = () => {
  const database = useDatabase()

  useEffect(
    () => () => {
      // Reset cache on unmount
      promise = null
      todos = false
    },
    []
  )

  if (todos === false) {
    if (promise === null) {
      promise = database
        .getTodos()
        ///*
        .then(
          (result) =>
            new Promise<typeof result>((resolve) =>
              setTimeout(() => resolve(result), 3000)
            )
        )
        // */
        .then(
          (result) => {
            todos = result
          },
          (err) => console.error(err)
        )
    }
    throw promise
  }

  return todos
}
