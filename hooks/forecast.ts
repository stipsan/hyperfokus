import type { Schedule, Todo } from 'database/types'
import * as React from 'react'
import { useEffect, useMemo, useState, useLayoutEffect } from 'react'
import { createAsset } from 'use-asset'
import { getForecast } from 'utils/forecast'
import { sleep } from 'utils/time'



// workaround @types/react being out of date
const useDeferredValue: typeof React.unstable_useDeferredValue =
  // @ts-expect-error
  React.useDeferredValue
const useTransition: typeof React.unstable_useTransition =
  // @ts-expect-error
  React.useTransition

async function computeForecast(
  schedules: Schedule[],
  todos: Todo[],
  lastReset: Date,
  deadlineMs: number
) {
  console.log('any action??', JSON.parse(JSON.stringify({ schedules, todos, lastReset, deadlineMs })))
  await sleep(5000)
  console.log('yes', JSON.parse(JSON.stringify({ schedules, todos, lastReset, deadlineMs })))
  return getForecast(schedules, todos, lastReset, deadlineMs)
}
const asset = createAsset(computeForecast)

export function useForecastComputer(schedules: Schedule[], todos: Todo[]) {
  const wrappedAsset = useMemo(
    () => ({
      read: (lastReset: Date, deadlineMs: number) =>
        asset.read(schedules, todos, lastReset, deadlineMs),
      preload: (lastReset: Date, deadlineMs: number) =>
        asset.preload(schedules, todos, lastReset, deadlineMs),
      clear: (lastReset: Date, deadlineMs: number) =>
        asset.clear(schedules, todos, lastReset, deadlineMs),
      peek: (lastReset: Date, deadlineMs: number) =>
        asset.peek(schedules, todos, lastReset, deadlineMs),
    }),
    [schedules, todos]
  )
  const [resource, setResource] = useState(() => wrappedAsset)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    console.log('schedules changed', schedules)
  }, [schedules])
  useEffect(() => {
    console.log('todos changed', todos)
  }, [todos])

  useLayoutEffect(() => {
    startTransition(() => {
      setResource(wrappedAsset)
    })
  }, [startTransition, wrappedAsset])

  useEffect(() => console.log({ wrappedAsset }), [wrappedAsset])
  useEffect(() => console.log({ resource }), [resource])
  useEffect(() => console.log({ isPending }), [isPending])

  return [resource, isPending] as const
}
