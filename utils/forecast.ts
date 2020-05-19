import type { Schedule, Todo } from 'database/types'
import { isSameDay, setHours, setMinutes } from 'date-fns'
import { getTime } from './time'

export type ForecastTodo = Todo & {
  start: string
  end: string
}

type ForecastSchedule = Schedule & {
  todos: ForecastTodo[]
}

interface Day {
  date: Date
  day: string
  schedule: ForecastSchedule[]
}

export type Forecast = {
  // Max allowed task duration by the schedule
  maxTaskDuration: number
  days: Day[]
}

const getWeekday = (date: Date) => {
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

// Break the loop if necessary, infinite loops are terrible
const LOOP_SAFETY_LIMIT = 1000
// Just a safety precaution until I get the algo right
const MAX_SCHEDULE_DAYS_LENGTH = 14

// Useful consts
const DAY_IN_MS = 86400000

// Provide times and tasks and get a complete schedule in return
// @TODO make it possible to specify the starting point, currently it's hardcoded to `today`
// @TODO filter out opportunities that are for today, if they have an endtime that is too late
export function getForecast(
  schedules: Schedule[],
  todos: Todo[],
  lastReset: Date
): Forecast {
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
  const reasonableTasks = todos.filter(
    (task) => !task.done && task.duration <= maxTaskDuration
  )

  // Map caches to speed up loops
  const availableDurationsPerTime = new Map()

  reasonableTasks.forEach((task) => {
    let i = 0
    let search = true
    while (i < LOOP_SAFETY_LIMIT && search) {
      i++

      let reuseDay = days.find(
        (day) =>
          !!day.schedule.find((schedule) => {
            let availableDuration = availableDurationsPerTime
              .get(day.date)
              .get(schedule.id)
            return availableDuration >= task.duration
          })
      )

      if (reuseDay) {
        const schedule = reuseDay.schedule.find((schedule) => {
          let availableDuration = availableDurationsPerTime
            .get(reuseDay!.date)
            .get(schedule.id)
          return availableDuration >= task.duration
        })

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

          search = false
        }
      }

      const lastIndex = days.length
      if (MAX_SCHEDULE_DAYS_LENGTH > lastIndex) {
        const date = new Date(today.getTime() + DAY_IN_MS * lastIndex)
        const weekday = getWeekday(date)
        const schedule: ForecastSchedule[] = []
        const shouldFilterOpportunitiesToday =
          shouldFilterToday && isSameDay(date, today)

        availableDurationsPerTime.set(date, new Map())

        normalizedTimes.forEach((time) => {
          let [hours, minutes] = time.start.split(':')
          const startHours = parseInt(hours, 10)
          const startMinutes = parseInt(minutes, 10)
          const startTime = setMinutes(setHours(date, startHours), startMinutes)

          if (time.repeat[weekday]) {
            if (!shouldFilterOpportunitiesToday || startTime > lastReset) {
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
    }
  })

  return {
    days,
    maxTaskDuration,
  }
}

// Takes a list over times and returns a normalized list that can be looped
// Filters out enabled: false, as well as checking if something without any repeat value is "enabled"
// or: if it's "disabled" because the after value is more than 24 hours ago from current time
export function normalizeTimes(times: Schedule[]) {
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

// The generator should work through day by day, yielding one day at time
