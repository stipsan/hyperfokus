// Ensure this module is never run in an SSR env by mistake

if (typeof window === 'undefined') {
  throw new TypeError(`This module can't be run on the server!`)
}

import {
  Activity,
  ActivityDelta,
  Area,
  Opportunity,
  OpportunityDelta,
  Repeat,
} from './types'

// This provider is mostly for testing, debugging etc

class EventEmitter<T> {
  // @TODO get rid of any
  listeners: any[] = []

  subscribe = (areaId: string, listener: (arg: T) => void) => {
    let isSubscribed = true

    const ref = [areaId, listener]
    this.listeners.push(ref)

    return () => {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      const index = this.listeners.indexOf(ref)
      this.listeners.splice(index, 1)
    }
  }
  dispatch = (areaId: string, arg: T) => {
    for (let i = 0; i < this.listeners.length; i++) {
      const [id, listener] = this.listeners[i]
      if (areaId === id) listener(arg)
    }
  }
}

const defaultState = { areas: [], opportunities: [], activities: [] }
const Memory = (
  initialState: {
    areas: Area[]
    opportunities: Opportunity[]
    activities: Activity[]
  } = defaultState
) => {
  let areas: Area[] = initialState.areas
  const areasUpdated = new EventEmitter<Area[]>()

  const opportunitiesMap = new Map<string, Opportunity[]>()
  if (initialState.opportunities && !initialState.areas) {
    throw new TypeError(`Can't specify opportunities without at least one area`)
  }
  if (initialState.opportunities) {
    const areaId = areas[0].id
    opportunitiesMap.set(areaId, initialState.opportunities)
  }

  const activitiesMap = new Map<string, Activity[]>()
  if (initialState.activities && !initialState.areas) {
    throw new TypeError(`Can't specify activities without at least one area`)
  }
  if (initialState.activities) {
    const areaId = areas[0].id
    activitiesMap.set(areaId, initialState.activities)
  }

  const opportunitiesUpdated = new EventEmitter<Opportunity[]>()
  const activitiesUpdated = new EventEmitter<Activity[]>()

  return {
    observeAreas(success) {
      success(areas)
      return areasUpdated.subscribe('*', (areas) => success(areas))
    },
    addArea(name) {
      const area = { id: new Date().toString(), name }
      areas.push(area)
      areasUpdated.dispatch('*', areas)
      return Promise.resolve(area)
    },
    async editArea(areaId, name) {
      const index = areas.findIndex((area) => area.id === areaId)
      areas[index].name = name
      areasUpdated.dispatch('*', areas)
    },
    async deleteArea(areaId) {
      if (areas.length < 2) {
        throw new Error(`Can't delete the last Focus Area`)
      }

      const index = areas.findIndex((area) => area.id === areaId)

      if (index !== -1) areas.splice(index, 1)
      areasUpdated.dispatch('*', areas)
    },
    getOpportunities(areaId) {
      /*
        return new Promise(resolve => {
          setTimeout(() => resolve(opportunities), 1000)
        })
        //*/
      return Promise.resolve(opportunitiesMap.get(areaId) || [])
    },
    setOpportunities(maybeAreaId, nextOpportunities) {
      let areaId: string
      if (maybeAreaId) {
        areaId = maybeAreaId
      } else {
        areaId = new Date().toString()
        areas.push({ id: areaId, name: 'Default' })
        areasUpdated.dispatch('*', areas)
      }

      const opportunities = opportunitiesMap.get(areaId) || []
      nextOpportunities.forEach(
        ({ added, edited, deleted, ...nextOpportunity }) => {
          if (added) {
            // @ts-expect-error
            opportunities.push({
              ...nextOpportunity,
            })
          } else if (edited) {
            const existing = opportunities.findIndex(
              (opportunity) => opportunity.id === nextOpportunity.id
            )
            if (existing !== -1)
              Object.assign(opportunities[existing], nextOpportunity)
          } else if (deleted) {
            const existing = opportunities.findIndex(
              (opportunity) => opportunity.id === nextOpportunity.id
            )

            if (existing !== -1) opportunities.splice(existing, 1)
          }
        }
      )
      opportunitiesMap.set(areaId, opportunities)
      opportunitiesUpdated.dispatch(areaId, opportunities)

      return new Promise((resolve) => setTimeout(() => resolve(), 300))
    },
    observeOpportunities(areaId, success) {
      success(opportunitiesMap.get(areaId) || [])
      return opportunitiesUpdated.subscribe(areaId, (opportunities) =>
        success(opportunities)
      )
    },
    observeActivities(areaId, success) {
      const filterActivities = (activity: Activity) => !activity.done
      /* ||
        const now = new Date()
          (activity.done &&
            activity.completed &&
            differenceInHours(activity.completed, now) <= 24)
            // */

      const activities = activitiesMap.get(areaId) || []
      success(activities.filter(filterActivities))
      return activitiesUpdated.subscribe(areaId, (activities) =>
        success(activities.filter(filterActivities))
      )
    },
    addActivity(areaId, activityDelta) {
      let activities = activitiesMap.get(areaId) || []
      const activity: Activity = {
        id: `activity-${activities.length + 1}`,
        order: activities.length + 1,
        done: false,
        created: new Date(),
        modified: new Date(),
        ...activityDelta,
      }
      activities = [...activities, activity]
      activitiesUpdated.dispatch(areaId, activities)
      activitiesMap.set(areaId, activities)

      return Promise.resolve(activity)
    },
    editActivity(areaId, activityId, activityDelta) {
      const activities = activitiesMap.get(areaId) || []

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

          activitiesUpdated.dispatch(areaId, activities)
          activitiesMap.set(areaId, activities)

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    completeActivity(areaId, activityId) {
      const activities = activitiesMap.get(areaId) || []

      return new Promise((resolve, reject) => {
        try {
          const index = activities.findIndex(
            (activity) => activity.id === activityId
          )
          activities[index] = {
            ...activities[index],
            completed: new Date(),
          }

          activitiesUpdated.dispatch(areaId, activities)
          activitiesMap.set(areaId, activities)

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    incompleteActivity(areaId, activityId) {
      const activities = activitiesMap.get(areaId) || []

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

          activitiesUpdated.dispatch(areaId, activities)
          activitiesMap.set(areaId, activities)

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    getCompletedActivities(areaId) {
      const activities = activitiesMap.get(areaId) || []

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
    archiveCompletedActivities(areaId) {
      const activities = activitiesMap.get(areaId) || []

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

          activitiesUpdated.dispatch(areaId, activities)
          activitiesMap.set(areaId, activities)

          const observedArea = areas.findIndex((area) => area.id === areaId)
          if (!areas[observedArea]) {
            throw new TypeError("Could't find area")
          }
          areas[observedArea].lastReset = new Date()
          areasUpdated.dispatch('*', areas)

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    reorderActivities(areaId, activityId, order) {
      const activities = activitiesMap.get(areaId) || []

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

          activitiesUpdated.dispatch(areaId, activities)
          activitiesMap.set(areaId, activities)

          resolve()
        } catch (err) {
          reject(err)
        }
      })
    },
    observeLastAreaReset(areaId, success, failure) {
      const findArea = (areas: Area[]) => {
        try {
          const observedArea = areas.find((area) => area.id === areaId)
          if (!observedArea) {
            return failure(new TypeError('Invalid area id'))
          }
          if (observedArea.lastReset) {
            success(observedArea.lastReset)
          }
        } catch (err) {
          failure(err)
        }
      }
      findArea(areas)
      return areasUpdated.subscribe('*', (areas) => findArea(areas))
    },
  }
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
  areas: Area[]
  opportunities: Opportunity[]
  activities: Activity[]
} = {
  opportunities: [
    { start: '07:20', duration: 60, end: '08:20', repeat: repeatWeekdays },
    { start: '11:00', duration: 120, end: '13:00', repeat: repeatWeekends },
    { start: '18:00', duration: 60, end: '19:00', repeat: repeatAll },
  ].map((opportunity: OpportunityDelta, i) => ({
    id: `opportunity-${i}`,
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
    ...opportunity,
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
    (activity: ActivityDelta, i): Activity => {
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
  areas: [{ id: new Date().toString(), name: 'Default' }],
}

export default Memory(initialState)
