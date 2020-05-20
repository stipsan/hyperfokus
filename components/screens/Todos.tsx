import useInterval from '@use-it/interval'
import cx from 'classnames'
import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import type { Todo } from 'database/types'
import {
  isAfter,
  isBefore,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns'
import { useDatabase } from 'hooks/database'
import { useGetSchedules } from 'hooks/schedules'
import { useGetTodos } from 'hooks/todos'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, useEffect, useReducer, useState } from 'react'
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import { getForecast } from 'utils/forecast'
import type { Forecast, ForecastTodo } from 'utils/forecast'
import styles from './Todos.module.css'

const Field: FC<{
  className?: string
  label: string
  htmlFor?: string
}> = ({ className, label, htmlFor, children }) => {
  return (
    <label className={cx('block', className)} htmlFor={htmlFor}>
      <span className="text-gray-700">{label}</span>
      {children}
    </label>
  )
}

const Duration = ({
  dispatch,
  state,
}: {
  dispatch: Function
  state: {
    duration: number
  }
}) => (
  <div className="mt-1 flex">
    <input
      required
      autoComplete="off"
      className="form-input rounded-r-none z-10 w-20 tnum"
      type="number"
      min="1"
      max="1439"
      step="1"
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder="60"
      id="duration"
      name="duration"
      // @TODO spread out value, onChange and the other events instead of needing to know about dispatch and state
      value={state.duration > 0 ? state.duration : ''}
      onChange={({ target: { name, value } }) =>
        dispatch({
          type: 'change',
          payload: { name, value: parseInt(value, 10) },
        })
      }
      onBlur={() => dispatch({ type: 'blur:duration' })}
    />
    <span className="form-input border-l-0 rounded-l-none bg-gray-100 text-gray-800">
      minutes
    </span>
  </div>
)

type FormActions =
  | { type: 'reset'; payload: Todo }
  | { type: 'change'; payload: { name: string; value: unknown } }
  | { type: 'blur:start' }
  | { type: 'blur:duration' }
  | { type: 'blur:end' }
  | { type: 'change:enabled'; payload: { value: boolean } }
  | { type: 'change:snapshot'; payload: Todo }
function reducer(state: Todo, action: FormActions) {
  switch (action.type) {
    case 'reset':
      return action.payload
    case 'change':
      return { ...state, [action.payload.name]: action.payload.value }
    case 'change:enabled':
      return { ...state, enabled: action.payload.value, after: new Date() }
    case 'change:snapshot':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const TodoForm = ({
  initialState = {
    created: new Date(),
    modified: undefined,
    id: '',
    duration: 0,
    done: false,
    description: '',
    order: 0,
  },
  onDismiss,
  onSubmit,
  editing,
  onDelete,
}: {
  initialState?: Todo
  editing?: boolean
  onDismiss: () => void
  onSubmit: (state: Todo) => void
  onDelete?: () => void
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        onSubmit(state)
      }}
    >
      <Field className={styles.duration} label="Duration" htmlFor="duration">
        <Duration dispatch={dispatch} state={state} />
      </Field>

      {editing && (
        <div className="block mt-4">
          <span className="block text-gray-700">Enabled</span>
          <div className="mt-1 inline-grid grid-flow-col gap-4">
            <label className="inline-grid grid-flow-col gap-2 items-center">
              <input
                type="radio"
                className="form-radio"
                name="enabled"
                value="yes"
                checked={state.done}
                onChange={(event) =>
                  dispatch({
                    type: 'change',
                    payload: {
                      name: event.target.name,
                      value: true,
                    },
                  })
                }
              />
              <span>Yes</span>
            </label>
            <label className="inline-grid grid-flow-col gap-2 items-center">
              <input
                type="radio"
                className="form-radio"
                name="enabled"
                value="no"
                checked={!state.done}
                onChange={(event) =>
                  dispatch({
                    type: 'change',
                    payload: {
                      name: event.target.name,
                      value: false,
                    },
                  })
                }
              />
              No
            </label>
          </div>
        </div>
      )}
      <div className="py-4" />
      <DialogToolbar
        left={
          onDelete ? (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          ) : undefined
        }
        right={
          <>
            <Button variant="default" onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onDismiss} type="submit">
              Save
            </Button>
          </>
        }
      />
    </form>
  )
}

const CheckboxLabel: FC<{ onClick: (event: any) => void }> = ({
  children,
  onClick,
}) => (
  <label className={cx(styles.checkboxLabel, 'px-inset-l')} onClick={onClick}>
    {children}
  </label>
)

const Time = forwardRef<
  HTMLSpanElement,
  { children: ReactNode; title?: string }
>(({ children, title, ...props }, forwardedRef) => (
  <span {...props} ref={forwardedRef} className={cx(styles.time)} title={title}>
    {children}
  </span>
))

const StyledCheckbox: React.FC<{
  onChange: (event: any) => void
  onClick: (event: any) => void
  checked?: boolean
}> = ({ onClick, ...props }) => {
  return (
    <CheckboxLabel onClick={onClick}>
      <input className="form-checkbox" type="checkbox" {...props} />
    </CheckboxLabel>
  )
}

const TodoItem: React.FC<{
  todo: ForecastTodo
  isToday: boolean
  now: Date
  setTodos: Dispatch<SetStateAction<Todo[]>>
}> = ({ todo, isToday, now, setTodos }) => {
  let isOverdue = false
  let isCurrent = false
  if (isToday) {
    let [endHours, endMinutes] = todo.end.split(':').map((_) => parseInt(_, 10))
    const endTime = setSeconds(
      setMinutes(setHours(now, endHours), endMinutes),
      0
    )

    let [startHours, startMinutes] = todo.start
      .split(':')
      .map((_) => parseInt(_, 10))
    const startTime = setSeconds(
      setMinutes(setHours(now, startHours), startMinutes),
      0
    )

    isOverdue = isBefore(endTime, now)

    //console.log('isToday', { todo, now, startTime, endTime })
    isCurrent = isBefore(startTime, now) && isAfter(endTime, now)
    if (isCurrent) {
      console.warn('is current', { todo, startTime, endTime, now })
    }
  }

  return (
    <li
      className={cx(styles.todo, {
        'is-current': isCurrent,
        'is-overdue': isOverdue,
      })}
    >
      <Link key="time" href={`?edit=${todo.id}`} shallow scroll={false}>
        <Time title={`Duration: ${todo.duration}m`}>
          {todo.start} – {todo.end}
        </Time>
      </Link>
      <Link key="description" href={`?edit=${todo.id}`} shallow scroll={false}>
        <a className={cx(styles.description, 'focus:outline-none px-inset-r')}>
          {todo.description}
        </a>
      </Link>
      <StyledCheckbox
        checked={!!todo.completed}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          setTodos((todos) => {
            const index = todos.findIndex((search) => search.id === todo.id)

            const newTodos = replaceItemAtIndex(todos, index, {
              ...todos[index],
              completed: todos[index].completed ? undefined : new Date(),
            })
            return newTodos
          })
        }}
      />
    </li>
  )
}

const Items: FC = ({ children }) => <ul className={styles.items}>{children}</ul>

const Header: FC = ({ children }) => (
  <h3 className={cx('px-inset', styles.header)}>{children}</h3>
)

const Section: FC<{ className?: string }> = ({ children, className }) => (
  <section className={cx(styles.section, className)}>{children}</section>
)

const CreateDialog = () => {
  const router = useRouter()

  const close = () => {
    router.push(router.pathname, undefined, { shallow: true, scroll: false })
  }

  return (
    <AnimatedDialog
      isOpen={!!router.query.create}
      onDismiss={close}
      aria-label="Create new todo"
    >
      <p className="py-16 text-center">
        The ability to create todos are on its way!
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

const EditDialog = ({
  todos,
  setTodos,
}: {
  todos: Todo[]
  setTodos: Dispatch<SetStateAction<Todo[]>>
}) => {
  const router = useRouter()
  const [initialState, setInitialState] = useState(() =>
    todos.find((todo) => todo.id === router.query.edit)
  )

  useEffect(() => {
    if (router.query.edit) {
      const nextInitialState = todos.find(
        (todo) => todo.id === router.query.edit
      )
      if (nextInitialState) {
        setInitialState(nextInitialState)
      }
    }
  }, [router.query.edit])

  const close = () => {
    router.push(router.pathname, undefined, { shallow: true, scroll: false })
  }

  return (
    <AnimatedDialog
      isOpen={
        !!router.query.edit &&
        !!initialState &&
        router.query.edit === initialState.id
      }
      onDismiss={close}
      aria-label="Edit todo"
    >
      <TodoForm
        editing
        initialState={initialState}
        onDismiss={close}
        onSubmit={(state) => {
          setTodos((todos) => {
            const index = todos.findIndex(
              (schedule) => schedule.id === initialState.id
            )

            const newTodos = replaceItemAtIndex(todos, index, {
              ...todos[index],
              description: state.description,
              duration: state.duration,
              order: state.order,
            })
            return newTodos
          })
          setInitialState(state)
          close()
        }}
        onDelete={() => {
          if (
            confirm(
              `Are you sure you want to delete "${initialState.description}"?`
            )
          ) {
            setTodos((todos) => {
              const index = todos.findIndex(
                (todo) => todo.id === initialState.id
              )
              const newTodos = removeItemAtIndex(todos, index)
              return newTodos
            })
            close()
          }
        }}
      />
    </AnimatedDialog>
  )
}

// @TODO temporary workaround, go grab useLastAreaReset from v2
const lastReset = undefined /*new Date(
  'Mon May 18 2020 23:26:30 GMT+0200 (Central European Summer Time)'
)*/

export default () => {
  const [hyperfocusing, setHyperfocus] = useState(false)
  const database = useDatabase()
  const schedules = useGetSchedules()
  const [todos, setTodos] = useState(useGetTodos())
  const [forecast, setForecast] = useState<Forecast>({
    days: [],
    maxTaskDuration: 0,
  })
  const [now, setNow] = useState(new Date())

  // Update the now value every minute in case it changes the schedule
  useInterval(() => {
    setNow(new Date())
  }, 1000 * 60)

  // Sync with db
  useEffect(() => {
    database.setTodos(todos)
  }, [todos])

  // Regen forecast when necessary
  useEffect(() => {
    if (schedules.length > 0 && todos.length > 0) {
      setForecast(
        getForecast(
          schedules.filter((opportunity) => opportunity.enabled),
          todos,
          lastReset
        )
      )
    } else {
      setForecast({
        days: [],
        maxTaskDuration: 0,
      })
    }
  }, [schedules, todos, lastReset])

  return (
    <>
      {forecast.days?.map((day) => {
        if (!day.schedule?.some((pocket) => !!pocket.todos?.length)) {
          return null
        }

        const isToday = isSameDay(day.date, now)

        const dayText = isToday ? 'Today' : day.day
        const dateText = new Intl.DateTimeFormat(undefined, {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
        }).format(day.date)

        return (
          <Section
            key={day.date.toString()}
            className={cx({
              'is-today': isToday,
              'is-hyperfocus': hyperfocusing,
            })}
          >
            <Header>
              <span className="font-bold mr-1">{dayText}</span> {dateText}
            </Header>
            <Items>
              {day.schedule.map((pocket) =>
                pocket.todos?.map((task) => (
                  <TodoItem
                    key={task.id}
                    todo={task}
                    isToday={isToday}
                    now={now}
                    setTodos={setTodos}
                  />
                ))
              )}
            </Items>
          </Section>
        )
      })}
      {process.env.NODE_ENV === 'development' && (
        <Button
          className="block mx-auto my-4"
          onClick={() => setHyperfocus(!hyperfocusing)}
        >
          {hyperfocusing ? 'Disable Hyperfocusing' : 'Enable Hyperfocusing'}
        </Button>
      )}
      <CreateDialog />
      <EditDialog setTodos={setTodos} todos={todos} />
    </>
  )
}
