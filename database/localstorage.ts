// Ensure this module is never run in an SSR env by mistake

if (typeof window === 'undefined') {
  throw new TypeError(`This module can't be run on the server!`)
}

import localforage from 'localforage'
import { DatabaseType, Schedule, Todo } from './types'

localforage.config({
  name: 'hyperfokus',
  version: 1.0,
  storeName: 'localstorage',
})

const schedulesKey = 'hyperfokus.schedules.modified'

const database: DatabaseType = {
  async getSchedules() {
    const schedules = (await localforage.getItem('schedules')) as Schedule[]
    return schedules || []
  },
  async setSchedules(nextSchedules) {
    await localforage.setItem('schedules', nextSchedules)
    // Always write to the modified timestamp in case another tab is listening to changes
    localStorage.setItem(schedulesKey, JSON.stringify(new Date()))
  },
  observeSchedules(success, failure) {
    // Fire an success event right away
    this.getSchedules().then(success, failure)

    // Cross-tab events
    const handler = (event: StorageEvent) => {
      if (event.key !== schedulesKey) {
        return
      }
      this.getSchedules().then(success, failure)
    }
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('storage', handler)
    }
  },
  observeTodos() {
    throw new TypeError('Not implemented!')
  },
  async getTodos() {
    const todos = (await localforage.getItem('todos')) as Todo[]
    return todos || []
  },
  async setTodos(nextTodos) {
    await localforage.setItem('todos', nextTodos)
  },
  addTodo() {
    throw new TypeError('Not implemented!')
  },
  editTodo() {
    throw new TypeError('Not implemented!')
  },
  completeTodo() {
    throw new TypeError('Not implemented!')
  },
  incompleteTodo() {
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
