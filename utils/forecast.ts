import type { Schedule, Todo } from 'database/types'
import { isSameDay, setHours, setMinutes } from 'date-fns'
import { getTime } from './time'

// Stripping data where possible to keep IO between the worker & browser ont he down low
export type SkinnyTodo = Pick<Todo, 'id' | 'completed' | 'duration' | 'modified' | 'tags'>
export type SkinnySchedule = Pick<
  Schedule,
  'id' | 'start' | 'duration' | 'end' | 'repeat' | 'after'
>

type ForecastTodo = SkinnyTodo & {
  start: string
  end: string
}
type ForecastSchedule = SkinnySchedule & {
  todos: ForecastTodo[]
}

interface Day {
  date: Date
  day: string
  schedule: ForecastSchedule[]
}

export type Forecast = {
  // Max available task duration by the schedule
  maxTaskDuration: number
  days: Day[]
  // Gave up finding a time to do these todos
  timedout: SkinnyTodo[]
  withoutSchedule: SkinnyTodo[]
  withoutDuration: SkinnyTodo[]
  recentlyCompleted: number
}

function getWeekday(date: Date) {
  const i = date.getDay() % 7
  switch (i) {
    case 0:
      return 'sunday'
    case 1:
      return 'monday'
    case 2:
      return 'tuesday'
    case 3:
      return 'wednesday'
    case 4:
      return 'thursday'
    case 5:
      return 'friday'
    case 6:
      return 'saturday'
    default:
      throw new TypeError(`Invalid weekday integer: ${JSON.stringify(i)}`)
  }
}

// Useful consts
const DAY_IN_MS = 86400000

// TODO make the process two-step, if only todos change and not the schedules they should be largely reusable

// Provide times and tasks and get a complete schedule in return
// @TODO make it possible to specify the starting point, currently it's hardcoded to `today`
// @TODO filter out opportunities that are for today, if they have an endtime that is too late
export function getForecast(
  schedules: SkinnySchedule[],
  allTodos: SkinnyTodo[],
  tags: string[],
  lastReset: Date,
  deadlineMs: number
): Forecast {

  const todos: SkinnyTodo[] = (tags.length > 0 && !tags.includes('')) ? allTodos.filter((todo) => {
    // if Untagged, check if tags are emty, or empty array
    // Else if check if value exists in array
    if (
      tags.includes('untagged') &&
      (!todo.tags || todo.tags?.length === 0)
    ) {
      return true
    }

    if (todo.tags?.some((tag) => tags.includes(tag))) {
      return true
    }

    return false
  })
 : allTodos
 

  if (!schedules.length || !todos.length) {
    return {
      days: [],
      maxTaskDuration: 0,
      timedout: [],
      withoutDuration: [],
      withoutSchedule: [],
      recentlyCompleted: 0,
    }
  }

  const todoIds = new Set(todos.map((todo) => todo.id))
  // TODO deal with duplicate IDs
  if (todoIds.size !== todos.length) {
    console.warn(
      'Size mismatch on todos array',
      todos.length,
      'and todoIds Set',
      todoIds.size
    )
  }
console.log({deadlineMs})
  let days: Day[] = []
  let now = getTime()
  let today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  )
  const shouldFilterToday = isSameDay(today, lastReset)

  const normalizedTimes = normalizeTimes(schedules)

  // When looping and filling out tasks, make sure that maxTaskDuration is modified when needed
  // Rewrite to have one shared index for repeatable times, and separate map values for non-repeatable times
  let maxTaskDuration = normalizedTimes.reduce(
    (acc, time) => (time.duration > acc ? time.duration : acc),
    0
  )
  // Filter out tasks that are too large for the current schedule
  const withoutSchedule = todos.filter((todo) => todo.duration > maxTaskDuration)
  const reasonableTasks = todos.filter(
    (task) => task.duration > 0 && task.duration <= maxTaskDuration
  )

  // Map caches to speed up loops
  const availableDurationsPerTime = new Map()
  const timedout: SkinnyTodo[] = []

  const safeDeadlineMs = Math.max(0, Math.min(15000, deadlineMs))
  reasonableTasks.forEach((task) => {
    let scheduled = false
    // Don't allow more than 300ms time spent searching
    const start = Date.now()
    while (Date.now() < start + safeDeadlineMs) {
      // Step 2, loop generated days hoping to find am available slot
      let reuseDay = days.find(
        (day) =>
          !!day.schedule.find((schedule) => {
            let availableDuration = availableDurationsPerTime
              .get(day.date)
              .get(schedule.id)
            return availableDuration >= task.duration
          })
      )

      // Step 3, found a slot!
      if (reuseDay) {
        // TODO really wasteful to run the same exact loop again, just to find the schedule...
        const schedule = reuseDay.schedule.find((schedule) => {
          let availableDuration = availableDurationsPerTime
            .get(reuseDay.date)
            .get(schedule.id)
          return availableDuration >= task.duration
        })

        // Step 4, updating the schedule now that the slot is filled
        if (schedule) {
          const availableDuration = availableDurationsPerTime
            .get(reuseDay.date)
            .get(schedule.id)
          const updatedDuration = availableDuration - task.duration
          availableDurationsPerTime
            .get(reuseDay.date)
            .set(schedule.id, updatedDuration)

          const [timeEndHours, timeEndMinutes] = schedule.end.split(':')
          const timeEndHoursNormalized = parseInt(timeEndHours, 10)
          const timeEndMinutesNormalized = parseInt(timeEndMinutes, 10)
          const timeEndTotal =
            timeEndHoursNormalized * 60 +
            timeEndMinutesNormalized -
            updatedDuration
          const end = `${Math.floor(timeEndTotal / 60)
            .toString()
            .padStart(2, '0')}:${(timeEndTotal % 60)
            .toString()
            .padStart(2, '0')}`

          const taskStartTotal = timeEndTotal - task.duration
          const start = `${Math.floor(taskStartTotal / 60)
            .toString()
            .padStart(2, '0')}:${(taskStartTotal % 60)
            .toString()
            .padStart(2, '0')}`

          schedule.todos.push({ ...task, end, start })

          // Step 5, Found a match , we done, end the loop
          scheduled = true
          break
        }
      }

      // Step 1, create `day` placeholders
      const date = new Date(today.getTime() + DAY_IN_MS * days.length)
      const weekday = getWeekday(date)
      const schedule: ForecastSchedule[] = []
      const shouldFilterOpportunitiesToday =
        shouldFilterToday && isSameDay(date, today)

      availableDurationsPerTime.set(date, new Map())

      normalizedTimes.forEach((time) => {
        const [startHours, startMinutes] = time.start
          .split(':')
          .map((_) => parseInt(_, 10))
        const [endHours, endMinutes] = time.end
          .split(':')
          .map((_) => parseInt(_, 10))
        const endTime = setMinutes(setHours(date, endHours), endMinutes)

        if (time.repeat[weekday]) {
          if (!shouldFilterOpportunitiesToday || endTime > lastReset) {
            schedule.push({ ...time, todos: [] })
            availableDurationsPerTime.get(date).set(time.id, time.duration)
          }
        }

        if (
          !time.repeat.monday &&
          !time.repeat.tuesday &&
          !time.repeat.wednesday &&
          !time.repeat.thursday &&
          !time.repeat.friday &&
          !time.repeat.saturday &&
          !time.repeat.sunday
        ) {
          let yes = false

          // Check if it applys to the next day or same day
          if (
            startHours > time.after.getHours() ||
            (startHours === time.after.getHours() &&
              startMinutes > time.after.getMinutes())
          ) {
            yes =
              date.getFullYear() === time.after.getFullYear() &&
              date.getMonth() === time.after.getMonth() &&
              date.getDate() === time.after.getDate()
            // Should apply if the "after" timestamp matches today
          } else {
            // Should apply when it's the day after the "after" timestamp
            const after = new Date(time.after.getTime() + DAY_IN_MS)
            yes =
              date.getFullYear() === after.getFullYear() &&
              date.getMonth() === after.getMonth() &&
              date.getDate() === after.getDate()
          }

          if (yes) {
            availableDurationsPerTime.get(date).set(time.id, time.duration)
            schedule.push({ ...time, todos: [] })
          }
        }
      })

      const [firstLetter, ...rest] = weekday
      const day = [firstLetter.toUpperCase(), ...rest].join('')

      days.push({ date, day, schedule })
    }

    if (!scheduled) {
      timedout.push(task)
    }
  })

  return {
    days,
    maxTaskDuration,
    timedout,
    withoutSchedule,
    withoutDuration: todos.filter((task) => task.duration < 1),
    recentlyCompleted: todos.reduce((count, todo) => (todo.completed) ? count + 1 : count, 0)
  }
}

// Takes a list over times and returns a normalized list that can be looped
// Filters out enabled: false, as well as checking if something without any repeat value is "enabled"
// or: if it's "disabled" because the after value is more than 24 hours ago from current time
export function normalizeTimes(times: SkinnySchedule[]) {
  const sortedTimes = [...times].sort((a, b) => {
    const [aStartHours, aStartMinutes] = a.start.split(':')
    const [bStartHours, bStartMinutes] = b.start.split(':')

    if (
      aStartHours > bStartHours ||
      (aStartHours === bStartHours && aStartMinutes > bStartMinutes)
    ) {
      return 1
    }

    if (
      aStartHours < bStartHours ||
      (aStartHours === bStartHours && aStartMinutes < bStartMinutes)
    ) {
      return -1
    }

    return 0
  })

  return sortedTimes
}
