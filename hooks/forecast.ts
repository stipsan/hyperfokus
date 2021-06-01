import type { Schedule, Todo } from 'database/types'
import type { Forecast } from 'utils/forecast'
import { getForecast } from 'utils/forecast'
import { createAsset } from 'use-asset'
import { useEffect, useMemo, useState } from 'react'
import * as React from 'react'

// workaround @types/react being out of date
const useDeferredValue: typeof React.unstable_useDeferredValue =
  // @ts-expect-error
  React.useDeferredValue
const useTransition: typeof React.unstable_useTransition =
  // @ts-expect-error
  React.useTransition

export function useWebWorker(
  schedules: Schedule[],
  todos: Todo[],
  lastReset: Date,
  deadlineMs: number
): Forecast {
  return useWebBrowser(schedules, todos, lastReset, deadlineMs)
}

const asset = createAsset(
  async (
    schedules: Schedule[],
    todos: Todo[],
    lastReset: Date,
    deadlineMs: number
  ) => {
    if (schedules.length > 0 && todos.length > 0) {
      return getForecast(schedules, todos, lastReset, deadlineMs)
    } else {
      return {
        days: [],
        maxTaskDuration: 0,
        timedout: [],
      }
    }
  },
  15000
)

export function useWebBrowser(
  schedules: Schedule[],
  todos: Todo[],
  lastReset: Date,
  deadlineMs: number
): Forecast {
  const [forecast, setForecast] = useState<Forecast>(() =>
  asset.read(schedules, todos, lastReset, deadlineMs)
  )
  const [isPending, startTransition] = useTransition()
useEffect(() => console.log({isPending}), [isPending])

  // Regen forecast when necessary
  useEffect(() => {
    if (schedules.length > 0 && todos.length > 0) {
      setForecast(getForecast(schedules, todos, lastReset, deadlineMs))
    } else {
      setForecast({
        days: [],
        maxTaskDuration: 0,
        timedout: []
      })
    }
  }, [schedules, todos, lastReset, deadlineMs])

  /*
useEffect(() => {
  React.startTransition(() => {
    asset.read(schedules, todos, lastReset, deadlineMs)
  })
}, [schedules, todos, lastReset, deadlineMs])
// */

  return forecast
  return useDeferredValue(
    forecast,
    { timeoutMs: process.env.NEXT_PUBLIC_SUSPENSE_TIMEOUT_MS }
  )
  /*
  const forecast = useMemo<Forecast>(() => {
    if (schedules.length > 0 && todos.length > 0) {
      return getForecast(schedules, todos, lastReset, deadlineMs)
    } else {
      return ({
        days: [],
        maxTaskDuration: 0,
        timedout: []
      })
    }
  }, [schedules, todos, lastReset, deadlineMs])
  // */
  /*
  
*/

  return forecast
}
