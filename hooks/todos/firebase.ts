import type { Todo } from 'database/types'
import type { firestore, User } from 'firebase/app'
import { useMemo } from 'react'
import {
  useFirestore,
  useFirestoreCollectionData,
  useUser,
} from 'reactfire'
import { createAsset } from 'use-asset'
import type { AddTodo, EditTodo, DeleteTodo, CompleteTodo, IncompleteTodo, ArchiveTodos, Todos } from './types'
import { sanitize } from './utils'

type TodoDoc = {
  completed?: firestore.Timestamp
  created: firestore.Timestamp
  modified?: firestore.Timestamp
} & Exclude<Todo, 'completed' | 'created' | 'modified'>
// @TODO should be a directive that does the union and Exclude thing automatically

type Actions = {
  addTodo: AddTodo
  editTodo: EditTodo
  deleteTodo: DeleteTodo
  completeTodo: CompleteTodo
  incompleteTodo: IncompleteTodo
  archiveTodos: ArchiveTodos
}

// Unoptimized placeholder for now, will be rewritten to just use firebase apis instead of requiring a cache input
async function todosResource(
  todos: Todos,
  id: string
) {
  return todos.find((todo) => todo.id === id)
}
const todosAsset = createAsset(todosResource)
// allTodosResource will be used for plural

export function useTodos() {
  const user = useUser<User>()
  const firestore = useFirestore()
  const todosRef = firestore.collection('todos').where('author', '==', user.uid)
  const todosData = useFirestoreCollectionData<TodoDoc>(
    todosRef.orderBy('order', 'asc'),
    {
      idField: 'id',
    }
  )
  const todos = useMemo(
    () =>
      todosData.map((todo) => {
        const {
          completed,
          created,
          description,
          done,
          duration,
          id,
          modified,
          order,
          tags,
        } = todo

        return {
          completed: completed ? new Date(completed.seconds) : undefined,
          created: created ? new Date(created.seconds) : undefined,
          description,
          done,
          duration,
          id,
          modified: modified ? new Date(modified.seconds) : undefined,
          order,
          tags,
        }
      }),
    [todosData]
  )
  // TODO needs a rewrite to avoid all these explicit deps
  const todosResource =  useMemo(
    () => ({
      read: (id: string) =>
        todosAsset.read(todos, id),
      preload: (id: string) =>
        todosAsset.preload(todos, id),
      clear: (id: string) =>
        todosAsset.clear(todos, id),
      peek: (id: string) =>
        todosAsset.peek(todos, id),
    }),
    [ todos]
  )

  const actions = useMemo<Actions>(
    () => ({
      addTodo: async ({
        completed,
        created,
        description,
        done,
        duration,
        modified,
        order,
        tags,
      }) => {
        const data = sanitize({
          completed: completed === undefined ? null : completed,
          created,
          description,
          done,
          duration,
          modified: modified === undefined ? null : modified,
          order,
          tags,
        })
        // add firebase only stuff
        Object.assign(data, {author: user.uid,})

        if (order > 0) {
          const todos = await todosRef.orderBy('order', 'desc').limit(1).get()
          todos.forEach((todo) => {
            data.order = todo.data().order + 1
          })
        } else {
          const todos = await todosRef.orderBy('order', 'asc').limit(1).get()
          todos.forEach((todo) => {
            data.order = todo.data().order - 1
          })
        }

        // Workaround tainted data
        if (!isFinite(data.order)) {
          data.order = 0
        }

        const ref = await firestore.collection('todos').add(data)

        return { id: ref.id }
      },
      editTodo: async (
        {
          description,
          duration,
          order,
          tags,
        },
        id
      ) => {
        const data = sanitize({
          description,
          duration,
          modified: new Date(),
          order,
          tags,
        })

        if (order === 1) {
          const todos = await todosRef.orderBy('order', 'desc').limit(1).get()
          todos.forEach((todo) => {
            data.order = todo.data().order + 1
          })
        } else if (order === -1) {
          const todos = await todosRef.orderBy('order', 'asc').limit(1).get()
          todos.forEach((todo) => {
            data.order = todo.data().order - 1
          })
        }

        // Workaround tainted data
        if (!isFinite(data.order)) {
          data.order = 0
        }

        await firestore.collection('todos').doc(id).update(data)
      },
      deleteTodo: async (id) => {
        await firestore.collection('todos').doc(id).delete()
      },
      completeTodo: async (id) => {
        await firestore
          .collection('todos')
          .doc(id)
          .update({ completed: new Date() })
      },
      incompleteTodo: async (id) => {
        await firestore
          .collection('todos')
          .doc(id)
          .update({ completed: null, done: false })
      },
      archiveTodos: async () => {
        const snapshots = await todosRef
          .where('done', '==', false)
          .where('completed', '<', new Date())
          .get()
        let ops = []
        snapshots.forEach((snapshot) => {
          ops.push(
            firestore
              .collection('todos')
              .doc(snapshot.id)
              .update({ done: true })
          )
        })
        await Promise.all(ops)
      },
    }),
    [firestore, user.uid, todosRef]
  )

  return [todos, todosResource, actions] as const
}