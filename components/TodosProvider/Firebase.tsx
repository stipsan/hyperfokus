//useFirestoreCollectionData(query, { idField: 'id' })
import Button from 'components/Button'
import type { Todo } from 'database/types'
import type { firestore, User } from 'firebase/app'
import Link from 'next/link'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  AuthCheck,
  useFirestore,
  useFirestoreCollectionData,
  useUser,
} from 'reactfire'
import { DispatchProvider, StateProvider } from './Context'
import type { TodosDispatchContext } from './Context'

type TodoDoc = {
  completed?: firestore.Timestamp
  created: firestore.Timestamp
  modified?: firestore.Timestamp
} & Exclude<Todo, 'completed' | 'created' | 'modified'>
// @TODO should be a directive that does the union and Exclude thing automatically

const TodosProviders = ({ children }: { children: ReactNode }) => {
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
        }
      }),
    [todosData]
  )

  // @TODO verify that firestore is stable
  const context = useMemo(
    (): TodosDispatchContext => ({
      addTodo: async ({
        completed,
        created,
        description,
        done,
        duration,
        modified,
        order,
      }) => {
        const data = {
          author: user.uid,
          completed: completed === undefined ? null : completed,
          created,
          description,
          done,
          duration,
          modified: modified === undefined ? null : modified,
          order,
        }

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
    }),
    [firestore, user.uid]
  )

  return (
    <DispatchProvider value={context}>
      <StateProvider value={todos}>{children}</StateProvider>
    </DispatchProvider>
  )
}

export default ({ children }: { children: ReactNode }) => (
  <AuthCheck
    fallback={
      <>
        <Link href="/settings">
          <Button className="block mx-auto mt-32" variant="primary">
            Login
          </Button>
        </Link>
      </>
    }
  >
    <TodosProviders>{children}</TodosProviders>
  </AuthCheck>
)
