import TodosScreen from 'components/screens/todos'
import { useSchedules } from 'hooks/schedules/demo'
import { useAddTag, useTags } from 'hooks/tags/demo'
import {
  useAddTodo,
  useArchiveTodos,
  useCompleteTodo,
  useDeleteTodo,
  useEditTodo,
  useIncompleteTodo,
  useTodos,
  todosResource,
} from 'hooks/todos/demo'

export default function DemoTodosScreen() {
  const addTodo = useAddTodo()
  const editTodo = useEditTodo()
  const deleteTodo = useDeleteTodo()
  const completeTodo = useCompleteTodo()
  const incompleteTodo = useIncompleteTodo()
  const archiveTodos = useArchiveTodos()
  const addTag = useAddTag()

  const tags = useTags()
  const schedules = useSchedules()
  const todos = useTodos()

  return (
    <TodosScreen
      addTodo={addTodo}
      archiveTodos={archiveTodos}
      completeTodo={completeTodo}
      deleteTodo={deleteTodo}
      editTodo={editTodo}
      incompleteTodo={incompleteTodo}
      schedules={schedules}
      tags={tags}
      addTag={addTag}
      todos={todos}
      todosResource={todosResource}
    />
  )
}
