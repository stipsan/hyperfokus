import Button from 'components/Button'
import type { Schedule } from 'database/types'
import type { User } from 'firebase/app'
import Link from 'next/link'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  AuthCheck,
  useFirestore,
  useFirestoreCollectionData,
  useUser,
} from 'reactfire'
import { Provider } from './Context'
import type { SchedulesContext } from './Context'

type ScheduleDoc = {
  rules: Schedule[]
}

const SchedulesProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser<User>()
  const firestore = useFirestore()
  const schedulesRef = firestore
    .collection('schedules')
    .where('author', '==', user.uid)
  const schedulesDoc = useFirestoreCollectionData<ScheduleDoc>(schedulesRef)

  const context = useMemo(
    (): SchedulesContext => ({
      schedules: schedulesDoc?.[0]?.rules ?? [],
      setSchedules: async (value) => {
        const schedules =
          typeof value === 'function'
            ? value(schedulesDoc?.[0]?.rules ?? [])
            : value

        const schedulesSnapshots = await schedulesRef.get()
        let schedulesId = ''
        schedulesSnapshots.forEach((snapshot) => {
          schedulesId = snapshot.id
        })
        if (schedulesId === '') {
          const newScheduleRef = await firestore
            .collection('schedules')
            .add({ author: user.uid })
          schedulesId = newScheduleRef.id
        }

        // Ensure there's no duplicates
        const usedIds = new Set()
        const rules = schedules.filter((schedule) => {
          if (usedIds.has(schedule.id)) {
            return false
          }
          usedIds.add(schedule.id)
          return true
        })

        await firestore
          .collection('schedules')
          .doc(schedulesId)
          .update({ rules })
      },
    }),
    [schedulesDoc]
  )

  return <Provider value={context}>{children}</Provider>
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
    <SchedulesProvider>{children}</SchedulesProvider>
  </AuthCheck>
)
