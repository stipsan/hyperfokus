import { useDatabase } from 'hooks/database'
import { useGetSchedules } from 'hooks/schedules'
import { useGetTodos } from 'hooks/todos'
import { useEffect, useState } from 'react'

export default () => {
  const database = useDatabase()
  const schedules = useGetSchedules()
  const [todos, setTodos] = useState(useGetTodos())

  // Sync with db
  useEffect(() => {
    database.setTodos(todos)
  }, [todos])

  console.log({ schedules, todos })

  return <div>Oooooh yeah baby!</div>
}
