import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import { useDatabase } from 'hooks/database'
import { useGetSchedules } from 'hooks/schedules'
import { useGetTodos } from 'hooks/todos'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const CreateDialog = () => {
  const router = useRouter()

  const close = () => {
    router.push(router.pathname)
  }

  return (
    <AnimatedDialog
      isOpen={!!router.query.create}
      onDismiss={close}
      aria-label="Create new todo"
    >
      <p className="py-16 text-center">
        The ability to create todos is on its way!
      </p>
      <DialogToolbar
        right={
          <Button variant="primary" onClick={close}>
            Okay
          </Button>
        }
      />
    </AnimatedDialog>
  )
}

export default () => {
  const database = useDatabase()
  const schedules = useGetSchedules()
  const [todos, setTodos] = useState(useGetTodos())

  // Sync with db
  useEffect(() => {
    database.setTodos(todos)
  }, [todos])

  console.log({ schedules, todos })

  return (
    <>
      Oooooh yeah baby!
      <CreateDialog />
    </>
  )
}
