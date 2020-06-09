// Ensure this module is never run in an SSR env by mistake

if (typeof window === 'undefined') {
  throw new TypeError(`This module can't be run on the server!`)
}

import 'firebase/auth'
import 'firebase/firestore'
import { DatabaseType } from './types'

const database: DatabaseType = {
  async getSchedules() {
    throw new TypeError('Not implemented!')
  },
  async setSchedules(nextSchedules) {
    throw new TypeError('Not implemented!')
  },
  observeSchedules(success, failure) {
    throw new TypeError('Not implemented!')
  },
  observeTodos(success, failure) {
    throw new TypeError('Not implemented!')
  },
  async getTodos() {
    throw new TypeError('Not implemented!')
  },
  async setTodos(nextTodos) {
    throw new TypeError('Not implemented!')
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
