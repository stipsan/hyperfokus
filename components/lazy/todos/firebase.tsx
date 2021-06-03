import FirebaseAuthCheck from 'components/FirebaseAuthCheck'
import TodosScreen from 'components/screens/todos'
import { useSchedules } from 'hooks/schedules/firebase'
import { useTags } from 'hooks/tags/firebase'
import { useTodos } from 'hooks/todos/firebase'

export default function FirebaseTodosScreen() {
  const [tags, { addTag }] = useTags()
  const [schedules] = useSchedules()
  const [
    todos,
    todosResource,
    {
      addTodo,
      editTodo,
      deleteTodo,
      completeTodo,
      incompleteTodo,
      archiveTodos,
    },
  ] = useTodos()

  return (
    <FirebaseAuthCheck>
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
    </FirebaseAuthCheck>
  )
}
