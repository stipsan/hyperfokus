// Ensure this module is never run in an SSR env by mistake

if (typeof window === 'undefined') {
  throw new TypeError(`This module can't be run on the server!`)
}

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { DatabaseType, Schedule, Todo } from './types'

const database: DatabaseType = {
  async getSchedules() {
    // @TODO temporary workaround
    await new Promise((resolve) => {
      firebase.auth().onAuthStateChanged((user) => {
        resolve()
      })
    })

    if (!firebase.auth()?.currentUser?.uid) {
      return []
    }

    let schedules: Schedule[] = []
    const schedulesRef = await firebase
      .firestore()
      .collection('schedules')
      .where('author', '==', firebase.auth().currentUser.uid)
      .get()
    schedulesRef.forEach((snapshot) => {
      const { rules } = snapshot.data()
      rules.forEach((rule) => {
        const { after, duration, enabled, end, repeat, start, id } = rule
        schedules.push({
          id,
          after,
          duration,
          enabled,
          end,
          repeat,
          start,
        })
      })
    })

    return schedules
  },
  async setSchedules(nextSchedules) {
    throw new TypeError('Not implemented!')
  },
  observeSchedules(success, failure) {
    //throw new TypeError('Not implemented!')
    return () => {}
  },
  observeTodos(success, failure) {
    //throw new TypeError('Not implemented!')
    return () => {}
  },
  async getTodos() {
    // @TODO temporary workaround
    await new Promise((resolve) => {
      firebase.auth().onAuthStateChanged((user) => {
        resolve()
      })
    })

    if (!firebase.auth()?.currentUser?.uid) {
      return []
    }

    let todos: Todo[] = []
    const todosRef = await firebase
      .firestore()
      .collection('todos')
      .where('author', '==', firebase.auth().currentUser.uid)
      .get()
    todosRef.forEach((snapshot) => {
      const {
        completed,
        created,
        description,
        done,
        duration,
        modified,
        order,
      } = snapshot.data()
      todos.push({
        id: snapshot.id,
        completed,
        created,
        description,
        done,
        duration,
        modified,
        order,
      })
    })

    return todos
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
