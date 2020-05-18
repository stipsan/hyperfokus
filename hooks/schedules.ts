import type { Schedule } from 'database/types'
import { useDatabase } from 'hooks/database'
import { useEffect } from 'react'

// Get a schedules list using suspense, useful to put in useState or similar
let promise = null
let schedules: false | Schedule[] = false
export const useGetSchedules = () => {
  const database = useDatabase()

  useEffect(
    () => () => {
      // Reset cache on unmount
      promise = null
      schedules = false
    },
    []
  )

  if (schedules === false) {
    if (promise === null) {
      promise = database
        .getSchedules()
        /*
        .then(
          (result) =>
            new Promise<typeof result>((resolve) =>
              setTimeout(() => resolve(result), 3000)
            )
        )
        // */
        .then(
          (result) => {
            schedules = result
          },
          (err) => console.error(err)
        )
    }
    throw promise
  }

  return schedules
}
