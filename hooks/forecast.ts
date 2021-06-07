import type { Schedule, Todo } from 'database/types'
import { useEffect, useMemo, useState, useRef } from 'react'
import { createAsset } from 'use-asset'
import { getForecast } from 'utils/forecast'
import type { SkinnyTodo, SkinnySchedule } from 'utils/forecast'

async function computeForecastWithBrowser(
  schedules: SkinnySchedule[],
  todos: SkinnyTodo[],
  tags: string[],
  lastReset: Date,
  deadlineMs: number
) {
  return getForecast(schedules, todos, tags, lastReset, deadlineMs)
}
const slowAsset = createAsset(computeForecastWithBrowser)

export function slimChonkySchedules(chonkySchedules: Schedule[]): SkinnySchedule[] {
  return chonkySchedules.map(({ id, after, duration, end, repeat, start }) => {
    return { id, after, duration, end, repeat, start }
  })
}

export function slimChonkyTodos(chonkyTodos: Todo[]): SkinnyTodo[] {
  return chonkyTodos.map(({ id, duration, completed, modified, tags, }) => {
    return { id, duration, completed, modified, tags }
  })
}

async function computeForecastWithWorker(
  workerRef: React.MutableRefObject<Worker>,
  schedules: SkinnySchedule[],
  todos: SkinnyTodo[],
  tags: string[],
  lastReset: Date,
  deadlineMs: number
): Promise<ReturnType<typeof getForecast>> {
  try {
    return await new Promise((resolve, reject) => {
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL('../utils/worker.js', import.meta.url),
          { type: 'module' }
        )
      }
      workerRef.current.onerror = reject
      workerRef.current.onmessage = (event) => {
        const {
          days = [],
          maxTaskDuration = 0,
          timedout = [],
          withoutDuration = [],
          withoutSchedule = [],
          recentlyCompleted = 0,
        } = event.data
        resolve({
          days,
          maxTaskDuration,
          timedout,
          withoutDuration,
          withoutSchedule,
          recentlyCompleted
        })
      }
      workerRef.current.postMessage({
        schedules,
        todos,
        tags,
        lastReset: lastReset.toJSON(),
        deadlineMs,
      })
    })
  } catch (err) {
    console.error('Worker failed, falling back to slow path', err)
    return getForecast(schedules, todos, tags, lastReset, deadlineMs)
  }
}
const fastAsset = createAsset(computeForecastWithWorker)

const goFast = 'Worker' in window
export function useForecastComputer() {
  const workerRef = useRef<Worker>()
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        // TODO consider refactoring this
        workerRef.current.terminate()
        // eslint-disable-next-line react-hooks/exhaustive-deps
        delete workerRef.current
      }
    }
  }, [])
  const wrappedFastAsset = useMemo(
    () => ({
      read: (...args:Parameters<typeof slowAsset.read>) =>
        fastAsset.read(
          workerRef,
          ...args
        ),
      preload: (...args:Parameters<typeof slowAsset.preload>) =>
        fastAsset.preload(
          workerRef,
          ...args
        ),
      clear: (...args:Parameters<typeof slowAsset.clear>) =>
        fastAsset.clear(
          workerRef,
         ...args
        ),
        peek: (...args:Parameters<typeof slowAsset.peek>) =>
        fastAsset.peek(
          workerRef,
          ...args
        ),
    }),
    [workerRef]
  )
  useEffect(() => console.count('wrappedFastAsset changed'), [wrappedFastAsset])
  const [resource, setResource] = useState(() =>
    goFast ? wrappedFastAsset : slowAsset
  )

  useEffect(() => {
      setResource(goFast ? wrappedFastAsset : slowAsset)
  }, [wrappedFastAsset])

  return resource
}
