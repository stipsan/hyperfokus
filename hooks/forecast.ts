import type { Schedule, Todo } from 'database/types'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { createAsset } from 'use-asset'
import { getForecast } from 'utils/forecast'
import type { SkinnyTodo, SkinnySchedule } from 'utils/forecast'

async function computeForecastWithBrowser(
  schedules: SkinnySchedule[],
  todos: SkinnyTodo[],
  lastReset: Date,
  deadlineMs: number
) {
  return getForecast(schedules, todos, lastReset, deadlineMs)
}
const slowAsset = createAsset(computeForecastWithBrowser)

async function computeForecastWithWorker(
  workerRef: React.MutableRefObject<Worker>,
  schedules: SkinnySchedule[],
  todos: SkinnyTodo[],
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
        } = event.data
        resolve({
          days,
          maxTaskDuration,
          timedout,
          withoutDuration,
          withoutSchedule,
        })
      }
      workerRef.current.postMessage({
        schedules,
        todos,
        lastReset: lastReset.toJSON(),
        deadlineMs,
      })
    })
  } catch (err) {
    console.error('Worker failed, falling back to slow path', err)
    return getForecast(schedules, todos, lastReset, deadlineMs)
  }
}
const fastAsset = createAsset(computeForecastWithWorker)

const goFast = 'Worker' in window
export function useForecastComputer(
  chonkySchedules: Schedule[],
  chonkyTodos: Todo[]
) {
  const schedules = useMemo<SkinnySchedule[]>(
    () =>
      chonkySchedules.map(({ id, after, duration, end, repeat, start }) => {
        return { id, after, duration, end, repeat, start }
      }),
    [chonkySchedules]
  )
  const todos = useMemo<SkinnyTodo[]>(
    () =>
      chonkyTodos.map(({ id, duration, done, modified }) => {
        return { id, duration, done, modified }
      }),
    [chonkyTodos]
  )
  const [isPending, startTransition] = useTransition()
  const wrappedSlowAsset = useMemo(
    () => ({
      read: (lastReset: Date, deadlineMs: number) =>
        slowAsset.read(schedules, todos, lastReset, deadlineMs),
      preload: (lastReset: Date, deadlineMs: number) =>
        slowAsset.preload(schedules, todos, lastReset, deadlineMs),
      clear: (lastReset: Date, deadlineMs: number) =>
        slowAsset.clear(schedules, todos, lastReset, deadlineMs),
      peek: (lastReset: Date, deadlineMs: number) =>
        slowAsset.peek(schedules, todos, lastReset, deadlineMs),
    }),
    [schedules, todos]
  )
  const workerRef = React.useRef<Worker>()
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
      read: (lastReset: Date, deadlineMs: number) =>
        fastAsset.read(
          workerRef,
          schedules,
          todos,
          lastReset,
          deadlineMs
        ),
      preload: (lastReset: Date, deadlineMs: number) =>
        fastAsset.preload(
          workerRef,
          schedules,
          todos,
          lastReset,
          deadlineMs
        ),
      clear: (lastReset: Date, deadlineMs: number) =>
        fastAsset.clear(
          workerRef,
          schedules,
          todos,
          lastReset,
          deadlineMs
        ),
      peek: (lastReset: Date, deadlineMs: number) =>
        fastAsset.peek(
          workerRef,
          schedules,
          todos,
          lastReset,
          deadlineMs
        ),
    }),
    [workerRef, schedules, todos]
  )
  const [resource, setResource] = useState(() =>
    goFast ? wrappedFastAsset : wrappedSlowAsset
  )

  useEffect(() => {
    startTransition(() => {
      setResource(goFast ? wrappedFastAsset : wrappedSlowAsset)
    })
  }, [startTransition, wrappedFastAsset, wrappedSlowAsset])

  return [resource, isPending] as const
}
