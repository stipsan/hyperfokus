import type { Schedule } from 'database/types'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import { sortByHoursMinutesString } from 'utils/time'

export function addSchedule(schedules: Schedule[], data: Schedule): Schedule[] {
  return [...schedules, data].sort(sortByTime)
}

export function editSchedule(
  schedules: Schedule[],
  data: Schedule,
  id: string
): Schedule[] {
  const index = schedules.findIndex((schedule) => schedule.id === id)

  const newSchedules = replaceItemAtIndex(schedules, index, {
    ...schedules[index],
    start: data.start,
    duration: data.duration,
    end: data.end,
    repeat: data.repeat,
    enabled: data.enabled,
  })
  return newSchedules.sort(sortByTime)
}

export function deleteSchedule(schedules: Schedule[], id: string): Schedule[] {
  const index = schedules.findIndex((schedule) => schedule.id === id)
  const newSchedules = removeItemAtIndex(schedules, index)
  return newSchedules
}

function sortByTime(a: Schedule, b: Schedule) {
  let result = sortByHoursMinutesString(a.start, b.start)
  return result !== 0 ? result : sortByHoursMinutesString(a.end, b.end)
}
