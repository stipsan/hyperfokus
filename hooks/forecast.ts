import type { Schedule, Todo } from 'database/types'
import type { Forecast } from 'utils/forecast'
import { getForecast } from 'utils/forecast'
import { createAsset } from 'use-asset'
import { useEffect, useState } from 'react'

export function useWebWorker(): Forecast {}

export function useWebBrowser(
  schedules: Schedule[],
  todos: Todo[],
  lastReset: Date,
  deadlineMs: number = 300
): Forecast {
  const [forecast, setForecast] = useState<Forecast>(() =>
    getForecast(schedules, todos, lastReset, deadlineMs)
  )

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

  return forecast
}
