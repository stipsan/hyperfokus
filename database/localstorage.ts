import localforage from 'localforage'
import { DatabaseType, Schedule, Tag, Todo } from './types'

// Ensure this module is never run in an SSR env by mistake
if (typeof window === 'undefined') {
  throw new TypeError(`This module can't run on the server!`)
}

localforage.config({
  name: 'hyperfokus',
  version: 1.0,
  storeName: 'localstorage',
})

const tagsKey = 'hyperfokus.tags.modified'
const schedulesKey = 'hyperfokus.schedules.modified'
const todosKey = 'hyperfokus.schedules.modified'

const database: DatabaseType = {
  async getTags() {
    const tags = (await localforage.getItem('tags')) as Tag[]
    return tags || []
  },
  async setTags(nextTags) {
    await localforage.setItem('tags', nextTags)
    // Always write to the modified timestamp in case another tab is listening to changes
    await localStorage.setItem(tagsKey, JSON.stringify(new Date()))
  },
  observeTags(success, failure) {
    // Fire an success event right away
    this.getTags().then(success, failure)

    // Cross-tab events
    const handler = (event: StorageEvent) => {
      if (event.key !== tagsKey) {
        return
      }
      this.getTags().then(success, failure)
    }
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('storage', handler)
    }
  },
  async getSchedules() {
    const schedules = (await localforage.getItem('schedules')) as Schedule[]
    return schedules || []
  },
  async setSchedules(nextSchedules) {
    await localforage.setItem('schedules', nextSchedules)
    // Always write to the modified timestamp in case another tab is listening to changes
    await localStorage.setItem(schedulesKey, JSON.stringify(new Date()))
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
  observeTodos(success, failure) {
    // Fire an success event right away
    this.getTodos().then(success, failure)

    // Cross-tab events
    const handler = (event: StorageEvent) => {
      if (event.key !== todosKey) {
        return
      }
      this.getTodos().then(success, failure)
    }
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('storage', handler)
    }
  },
  async getTodos() {
    const todos = (await localforage.getItem('todos')) as Todo[]
    return todos || []
  },
  async setTodos(nextTodos) {
    await localforage.setItem('todos', nextTodos)
    // Always write to the modified timestamp in case another tab is listening to changes
    await localStorage.setItem(todosKey, JSON.stringify(new Date()))
  },
}

export default database
