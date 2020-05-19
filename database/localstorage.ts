// Ensure this module is never run in an SSR env by mistake

if (typeof window === 'undefined') {
  throw new TypeError(`This module can't be run on the server!`)
}

import localforage from 'localforage'
import { DatabaseType, Schedule } from './types'

localforage.config({
  name: 'hyperfokus',
  version: 1.0,
  storeName: 'localstorage',
})

const database: DatabaseType = {
  async getSchedules() {
    const schedules = (await localforage.getItem('schedules')) as Schedule[]
    return schedules || []
  },
  async setSchedules(nextSchedules) {
    await localforage.setItem('schedules', nextSchedules)
  },
  observeSchedules() {
    throw new TypeError('Not implemented!')
  },
  observeTodos() {
    throw new TypeError('Not implemented!')
  },
  addTodo(activityDelta) {
    throw new TypeError('Not implemented!')
  },
  editTodo(activityId, activityDelta) {
    throw new TypeError('Not implemented!')
  },
  completeTodo(activityId) {
    throw new TypeError('Not implemented!')
  },
  incompleteTodo(activityId) {
    throw new TypeError('Not implemented!')
  },
  getCompletedTodos() {
    throw new TypeError('Not implemented!')
  },
  archiveCompletedTodos() {
    throw new TypeError('Not implemented!')
  },
  reorderTodos() {
    throw new TypeError('Not implemented!')
  },
}

export default database
