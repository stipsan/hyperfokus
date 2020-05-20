// Ensure this module is never run in an SSR env by mistake

if (typeof window === 'undefined') {
  throw new TypeError(`This module can't be run on the server!`)
}

import {
  DatabaseType,
  Repeat,
  Schedule,
  ScheduleDelta,
  Todo,
  TodoDelta,
} from './types'

// This provider is mostly for testing, debugging etc

class EventEmitter<T> {
  // @TODO get rid of any
  listeners: any[] = []

  subscribe = (listener: (arg: T) => void) => {
    let isSubscribed = true

    this.listeners.push(listener)

    return () => {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      const index = this.listeners.indexOf(listener)
      this.listeners.splice(index, 1)
    }
  }
  dispatch = (arg: T) => {
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](arg)
    }
  }
}

const Memory = (initialState: {
  schedules: Schedule[]
  activities: Todo[]
}): DatabaseType => {
  let schedulesMap = initialState.schedules

  let todosMap = initialState.activities

  const schedulesUpdated = new EventEmitter<Schedule[]>()
  const todosUpdated = new EventEmitter<Todo[]>()

  return {
    getSchedules() {
      return Promise.resolve(schedulesMap || [])
    },
    setSchedules(nextSchedules) {
      const schedules = JSON.parse(JSON.stringify(nextSchedules))

      schedulesMap = schedules
      schedulesUpdated.dispatch(schedules)

      return Promise.resolve()
    },
    observeSchedules(success) {
      success(schedulesMap || [])
      return schedulesUpdated.subscribe((schedules) => success(schedules))
    },
    observeTodos(success) {
      const filterActivities = (activity: Todo) => !activity.done
      /* ||
        const now = new Date()
          (activity.done &&
            activity.completed &&
            differenceInHours(activity.completed, now) <= 24)
            // */

      const activities = todosMap || []
      success(activities.filter(filterActivities))
      return todosUpdated.subscribe((activities) =>
        success(activities.filter(filterActivities))
      )
    },
    getTodos() {
      return Promise.resolve(todosMap || [])
    },
    setTodos(nextTodos) {
      const todos = JSON.parse(JSON.stringify(nextTodos))

      todosMap = todos
      todosUpdated.dispatch(todos)

      return Promise.resolve()
    },
    addTodo(activityDelta) {
      let activities = todosMap || []
      const activity: Todo = {
        id: `activity-${activities.length + 1}`,
        order: activities.length + 1,
        done: false,
        created: new Date(),
        modified: new Date(),
        ...activityDelta,
      }
      activities = [...activities, activity]
      todosUpdated.dispatch(activities)
      todosMap = activities

      return Promise.resolve(activity)
    },
    editTodo(activityId, activityDelta) {
      const activities = todosMap || []

      return new Promise((resolve, reject) => {
        try {
          const index = activities.findIndex(
            (activity) => activity.id === activityId
          )
          const { description, duration } = activityDelta
          activities[index] = {
            ...activities[index],
            description,
            duration,
            modified: new Date(),
          }

          todosUpdated.dispatch(activities)
          todosMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    completeTodo(activityId) {
      const activities = todosMap || []

      return new Promise((resolve, reject) => {
        try {
          const index = activities.findIndex(
            (activity) => activity.id === activityId
          )
          activities[index] = {
            ...activities[index],
            completed: new Date(),
          }

          todosUpdated.dispatch(activities)
          todosMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    incompleteTodo(activityId) {
      const activities = todosMap || []

      return new Promise((resolve, reject) => {
        try {
          const index = activities.findIndex(
            (activity) => activity.id === activityId
          )
          activities[index] = {
            ...activities[index],
            completed: undefined,
            done: false,
          }

          todosUpdated.dispatch(activities)
          todosMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    getCompletedTodos() {
      const activities = todosMap || []

      return Promise.resolve(
        activities
          .filter((activity) => activity.done)
          .sort((a, b) => {
            if (!a.completed || !b.completed) {
              return 0
            }

            if (a.completed < b.completed) {
              return 1
            }
            if (a.completed > b.completed) {
              return -1
            }

            return 0
          })
      )
    },
    archiveCompletedTodos() {
      const activities = todosMap || []

      return new Promise((resolve, reject) => {
        try {
          const completedActivities = activities.filter(
            (activity) => !activity.done && !!activity.completed
          )

          completedActivities.forEach((completedActivity) => {
            const index = activities.findIndex(
              (activity) => activity.id === completedActivity.id
            )
            activities[index] = { ...activities[index], done: true }
          })

          todosUpdated.dispatch(activities)
          todosMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    reorderTodos(activityId, order) {
      const activities = todosMap || []

      return new Promise((resolve, reject) => {
        try {
          activities
            .sort((a, b) => {
              if (a.id === activityId && b.id === activityId) {
                return 0
              }

              if (order === -1) {
                console.log('sorting to top')

                // Handle all cases please
                if (a.id === activityId) {
                  return -1
                }

                if (b.id === activityId) {
                  return 1
                }
              }

              if (order === 1) {
                console.log('sorting to bottom')

                if (a.id === activityId) {
                  return 1
                }

                if (b.id === activityId) {
                  return -1
                }
              }

              if (a.order > b.order) {
                return 1
              }

              if (a.order < b.order) {
                return -1
              }

              return 0
            })
            .forEach((activity, i) => {
              activity.order = i
              activity.modified = new Date()
            })

          todosUpdated.dispatch(activities)
          todosMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
  }
}

const repeatNone: Repeat = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
}
const repeatWeekdays: Repeat = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
}
const repeatWeekends: Repeat = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: true,
  sunday: true,
}
const repeatAll: Repeat = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
}

const initialState: {
  schedules: Schedule[]
  activities: Todo[]
} = {
  schedules: [
    { start: '07:20', duration: 60, end: '08:20', repeat: repeatWeekdays },
    { start: '11:00', duration: 120, end: '13:00', repeat: repeatWeekends },
    { start: '18:00', duration: 60, end: '19:00', repeat: repeatAll },
    {
      start: '16:00',
      duration: 150,
      end: '18:30',
      repeat: { ...repeatNone, monday: true },
    },
    /*
    {
      start: '18:00',
      duration: 30,
      end: '18:30',
      repeat: { ...repeatNone, tuesday: true },
    },
    {
      start: '19:00',
      duration: 30,
      end: '19:30',
      repeat: { ...repeatNone, wednesday: true },
    },
    {
      start: '20:00',
      duration: 30,
      end: '20:30',
      repeat: { ...repeatNone, thursday: true },
    },
    {
      start: '21:00',
      duration: 30,
      end: '21:30',
      repeat: { ...repeatNone, friday: true },
    },
    {
      start: '22:00',
      duration: 30,
      end: '22:30',
      repeat: { ...repeatNone, saturday: true },
    },
    {
      start: '23:00',
      duration: 30,
      end: '23:30',
      repeat: { ...repeatNone, sunday: true },
    },
    // */
  ].map((schedule: ScheduleDelta, i) => ({
    id: `schedule-${i}`,
    after: new Date(),
    duration: 0,
    start: '00:00',
    end: '00:00',
    enabled: true,
    repeat: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    ...schedule,
  })),
  activities: [
    {
      description: 'Ability to create todos.',
      duration: 30,
      completed: new Date(),
    },
    {
      description: 'Ability to edit todos.',
      duration: 30,
      completed: new Date(),
    },
    {
      description: 'Ability to delete todos.',
      duration: 30,
      completed: new Date(),
    },
    { description: 'Settings screen.', duration: 60 },
    {
      description: 'Notify the user of todos that lack duration.',
      duration: 60,
    },
    {
      description: 'Notify of todos that are missing from the forecast.',
      duration: 60,
    },

    {
      description:
        'Implement daily reset for when todos are moved into the "Completed Todos" log and out of the planner.',
      duration: 30,
    },
    {
      description: 'About page with link to GitHub and other info.',
      duration: 30,
    },
    { description: 'Ability view completed todos.', duration: 30 },
    {
      description: 'Ability to toggle completed status on todos.',
      duration: 30,
    },
    {
      description:
        'Help page should explain how todos and schedules are interconnected',
      duration: 30,
    },
    {
      description:
        '"More" page should have a sidebar over links to its subpages.',
      duration: 30,
    },
    {
      description:
        'On mobile the "More" page should have a topbar over links to its subpages.',
      duration: 30,
    },
    {
      description:
        'Handle crazy long list of activities, list them under "Some day" or whatever',
      duration: 30,
    },
    { description: 'Norwegian locale and translations.', duration: 120 },
    { description: 'Add help page skeleton', duration: 15, done: true },
  ].map(
    (activity: TodoDelta, i): Todo => {
      const { created = new Date(), done = false } = activity
      const {
        modified = created,
        completed = done ? new Date() : undefined,
      } = activity

      return {
        id: `activity-${i}`,
        order: i,
        created,
        modified,
        done,
        completed,
        ...activity,
      }
    }
  ),
}

export default Memory(initialState)
