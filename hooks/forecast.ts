import type { Schedule, Todo } from 'database/types'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { createAsset } from 'use-asset'
import { getForecast } from 'utils/forecast'

// workaround @types/react being out of date
const useDeferredValue: typeof React.unstable_useDeferredValue =
  // @ts-expect-error
  React.useDeferredValue
const useTransition: typeof React.unstable_useTransition =
  // @ts-expect-error
  React.useTransition

async function computeForecastWithBrowser(
  schedules: Schedule[],
  todos: Todo[],
  lastReset: Date,
  deadlineMs: number
) {
  return getForecast(schedules, todos, lastReset, deadlineMs)
}
const slowAsset = createAsset(computeForecastWithBrowser)

async function computeForecastWithWorker(
  workerRef: React.MutableRefObject<Worker>,
  schedules: Schedule[],
  todos: Todo[],
  lastReset: Date,
  deadlineMs: number
): Promise<ReturnType<typeof getForecast>> {
  try {
    return await new Promise((resolve, reject) => {
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL('../utils/worker.js', import.meta.url), { type: "module" }
        )
      }
      workerRef.current.onerror = reject
      workerRef.current.onmessage = (event) => {
        console.log('onmessage', event.data, event)
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
      workerRef.current.postMessage({ schedules, todos, lastReset, deadlineMs })
    })
  } catch (err) {
    console.error('Worker failed, falling back to slow path', err)
    return getForecast(schedules, todos, lastReset, deadlineMs)
  }
}
const fastAsset = createAsset(computeForecastWithWorker)

const goFast = 'Worker' in window
export function useForecastComputer(schedules: Schedule[], todos: Todo[]) {
  useEffect(() => {
    console.log('todos changed', todos)
  }, [todos])
  useEffect(() => {
    console.log('schedules changed', schedules)
  }, [schedules])
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
        fastAsset.read(workerRef, schedules, todos, lastReset, deadlineMs),
      preload: (lastReset: Date, deadlineMs: number) =>
        fastAsset.preload(workerRef, schedules, todos, lastReset, deadlineMs),
      clear: (lastReset: Date, deadlineMs: number) =>
        fastAsset.clear(workerRef, schedules, todos, lastReset, deadlineMs),
      peek: (lastReset: Date, deadlineMs: number) =>
        fastAsset.peek(workerRef, schedules, todos, lastReset, deadlineMs),
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
