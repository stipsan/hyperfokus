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

  let activitiesMap = initialState.activities

  const schedulesUpdated = new EventEmitter<Schedule[]>()
  const activitiesUpdated = new EventEmitter<Todo[]>()

  return {
    getSchedules() {
      return Promise.resolve(schedulesMap || [])
    },
    setSchedules(nextSchedules) {
      const schedules = schedulesMap || []
      nextSchedules.forEach(({ added, edited, deleted, ...nextSchedule }) => {
        if (added) {
          schedules.push({
            ...nextSchedule,
          })
        } else if (edited) {
          const existing = schedules.findIndex(
            (schedule) => schedule.id === nextSchedule.id
          )
          if (existing !== -1) Object.assign(schedules[existing], nextSchedule)
        } else if (deleted) {
          const existing = schedules.findIndex(
            (schedule) => schedule.id === nextSchedule.id
          )

          if (existing !== -1) schedules.splice(existing, 1)
        }
      })
      schedulesMap = schedules
      schedulesUpdated.dispatch(schedules)

      return Promise.resolve()
    },
    observeSchedules(success) {
      success(schedulesMap || [])
      return schedulesUpdated.subscribe((schedules) => success(schedules))
    },
    observeActivities(success) {
      const filterActivities = (activity: Todo) => !activity.done
      /* ||
        const now = new Date()
          (activity.done &&
            activity.completed &&
            differenceInHours(activity.completed, now) <= 24)
            // */

      const activities = activitiesMap || []
      success(activities.filter(filterActivities))
      return activitiesUpdated.subscribe((activities) =>
        success(activities.filter(filterActivities))
      )
    },
    addActivity(activityDelta) {
      let activities = activitiesMap || []
      const activity: Todo = {
        id: `activity-${activities.length + 1}`,
        order: activities.length + 1,
        done: false,
        created: new Date(),
        modified: new Date(),
        ...activityDelta,
      }
      activities = [...activities, activity]
      activitiesUpdated.dispatch(activities)
      activitiesMap = activities

      return Promise.resolve(activity)
    },
    editActivity(activityId, activityDelta) {
      const activities = activitiesMap || []

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

          activitiesUpdated.dispatch(activities)
          activitiesMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    completeActivity(activityId) {
      const activities = activitiesMap || []

      return new Promise((resolve, reject) => {
        try {
          const index = activities.findIndex(
            (activity) => activity.id === activityId
          )
          activities[index] = {
            ...activities[index],
            completed: new Date(),
          }

          activitiesUpdated.dispatch(activities)
          activitiesMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    incompleteActivity(activityId) {
      const activities = activitiesMap || []

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

          activitiesUpdated.dispatch(activities)
          activitiesMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    getCompletedActivities() {
      const activities = activitiesMap || []

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
    archiveCompletedActivities() {
      const activities = activitiesMap || []

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

          activitiesUpdated.dispatch(activities)
          activitiesMap = activities

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    reorderActivities(activityId, order) {
      const activities = activitiesMap || []

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

          activitiesUpdated.dispatch(activities)
          activitiesMap = activities

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
    { description: 'Add ability to edit activities.', duration: 30 },
    {
      description: 'List tasks that are too long to fit the schedule',
      duration: 30,
    },
    {
      description:
        'Implement daily reset for when tasks are moved into the "Completed Activites" log and out of the planner.',
      duration: 30,
    },
    {
      description: 'Only render the first line of text for each activity.',
      duration: 30,
    },
    { description: 'Ability to delete activities.', duration: 30 },
    { description: 'Ability to delete opportunities.', duration: 30 },
    {
      description:
        'Help page should explain what the difference is between opportunities and activities',
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
