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
import { useActiveSchedules, useSchedulesObserver } from 'hooks/schedules'
import { useTodos, useTodosObserver } from 'hooks/todos'
import { nanoid } from 'nanoid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  forwardRef,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
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
    order: 1,
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
      <Field className="block w-full" label="Description" htmlFor="description">
        <textarea
          rows={4}
          required
          maxLength={2048}
          className="form-textarea mt-1 block w-full min-w-full max-w-full sm:w-64"
          id="description"
          value={state.description}
          onChange={(event) =>
            dispatch({
              type: 'change',
              payload: {
                name: 'description',
                value: event.target.value,
              },
            })
          }
        />
      </Field>

      <Field className="mt-4" label="Duration" htmlFor="duration">
        <Duration dispatch={dispatch} state={state} />
      </Field>

      {editing ? (
        <Field
          className="mt-4 block"
          label="Change ordering"
          htmlFor="ordering"
        >
          <select
            className="form-select block mt-1"
            id="ordering"
            value={state.order}
            onChange={(event) =>
              dispatch({
                type: 'change',
                payload: {
                  name: 'order',
                  value: parseInt(event.target.value, 10),
                },
              })
            }
          >
            <option value={initialState.order}>Keep current ordering</option>
            <option value={initialState.order - 1}>Move to the top</option>
            <option value={initialState.order + 1}>Move to the bottom</option>
          </select>
        </Field>
      ) : (
        <Field className="mt-4 block" label="Ordering" htmlFor="ordering">
          <select
            className="form-select block mt-1"
            id="ordering"
            value={state.order}
            onChange={(event) =>
              dispatch({
                type: 'change',
                payload: {
                  name: 'order',
                  value: parseInt(event.target.value, 10),
                },
              })
            }
          >
            <option value={-1}>Top</option>
            <option value={1}>Bottom</option>
          </select>
        </Field>
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
            <Button variant="primary" type="submit">
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
    isCurrent = isBefore(startTime, now) && isAfter(endTime, now)
  }

  return (
    <li
      className={cx(styles.todo, {
        'is-current': isCurrent,
        'is-overdue': isOverdue,
      })}
    >
      <Link key="time" href={`?edit=${todo.id}`} shallow scroll={false}>
        <Time title={`Duration: ${todo.duration} minutes`}>
          {todo.start} – {todo.end}
        </Time>
      </Link>
      <Link key="description" href={`?edit=${todo.id}`} shallow scroll={false}>
        <a
          className={cx(styles.description, 'focus:outline-none px-inset-r')}
          data-focus={todo.id}
        >
          {todo.description.trim()
            ? todo.description.replace(/^\n|\n$/g, '')
            : 'Untitled'}
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

const Header: FC<{ className?: string }> = ({ className, children }) => (
  <h3 className={cx('px-inset', styles.header, className)}>{children}</h3>
)

const Section = forwardRef<
  HTMLElement,
  { className?: string; children: ReactNode }
>(({ children, className }, forwardedRef) => (
  <section ref={forwardedRef} className={cx(styles.section, className)}>
    {children}
  </section>
))

const CreateDialog = ({
  onDismiss,
  setTodos,
}: {
  onDismiss: () => void
  setTodos: Dispatch<SetStateAction<Todo[]>>
}) => {
  const idRef = useRef(null)

  useEffect(() => {
    // Handle focus on close
    return () => {
      setTimeout(() => {
        if (!idRef.current) {
          return
        }
        const focusNode = document.querySelector(
          `a[data-focus="${idRef.current}"]`
        ) as HTMLElement
        focusNode?.focus()
      }, 300)
    }
  }, [])

  return (
    <TodoForm
      onDismiss={onDismiss}
      onSubmit={(state) => {
        setTodos((todos) => {
          const newTodo = {
            ...state,
            id: nanoid(),
            description: state.description.substring(0, 2048),
          }
          idRef.current = newTodo.id
          const { top, bottom } = findTopAndBottom(todos)

          return state.order > 0
            ? [...todos, { ...newTodo, order: bottom }]
            : [{ ...newTodo, order: top }, ...todos]
        })
        onDismiss()
      }}
    />
  )
}

function findTopAndBottom(todos: Todo[]): { top: number; bottom: number } {
  const mappedOrders = todos.map((todo) => todo.order)
  const top = mappedOrders.reduce((min, cur) => Math.min(min, cur), Infinity)
  const bottom = mappedOrders.reduce(
    (max, cur) => Math.max(max, cur),
    -Infinity
  )
  return { top, bottom }
}

const EditDialog = ({
  todos,
  setTodos,
  onDismiss,
  id,
}: {
  todos: Todo[]
  setTodos: Dispatch<SetStateAction<Todo[]>>
  onDismiss: () => void
  id: string
}) => {
  const [initialState, setInitialState] = useState(() =>
    todos.find((todo) => todo.id === id)
  )

  useEffect(() => {
    const nextInitialState = todos.find((todo) => todo.id === id)
    if (nextInitialState) {
      setInitialState(nextInitialState)
    }

    // Handle focus on close
    return () => {
      setTimeout(() => {
        const focusNode = document.querySelector(
          `a[data-focus="${id}"]`
        ) as HTMLElement
        focusNode?.focus()
      }, 300)
    }
  }, [id])

  return (
    <TodoForm
      editing
      initialState={initialState}
      onDismiss={onDismiss}
      onSubmit={(state) => {
        setTodos((todos) => {
          const index = todos.findIndex(
            (schedule) => schedule.id === initialState.id
          )
          let { order } = todos[index]
          let changedOrder = false

          if (order !== state.order) {
            const { top, bottom } = findTopAndBottom(todos)
            order = state.order > order ? bottom + 1 : top - 1
            changedOrder = true
          }

          const newTodos = replaceItemAtIndex(todos, index, {
            ...todos[index],
            description: state.description.substring(0, 2048),
            duration: state.duration,
            order,
          })

          if (changedOrder) {
            newTodos.sort((a, b) => {
              if (a.order < b.order) {
                return -1
              }
              if (a.order > b.order) {
                return 1
              }
              return 0
            })
          }

          return newTodos
        })
        setInitialState(state)
        onDismiss()
      }}
      onDelete={() => {
        if (
          confirm(
            `Are you sure you want to delete "${initialState.description}"?`
          )
        ) {
          setTodos((todos) => {
            const index = todos.findIndex((todo) => todo.id === initialState.id)
            const newTodos = removeItemAtIndex(todos, index)
            return newTodos
          })
          onDismiss()
        }
      }}
    />
  )
}

export default () => {
  useSchedulesObserver()
  useTodosObserver()

  const router = useRouter()
  const [hyperfocusing, setHyperfocus] = useState(false)
  const schedules = useActiveSchedules()
  const [todos, setTodos] = useTodos()
  const [lastReset, setLastReset] = useState<Date>(() =>
    setSeconds(setMinutes(setHours(new Date(), 0), 0), 0)
  )
  const [forecast, setForecast] = useState<Forecast>(() =>
    getForecast(schedules, todos, lastReset)
  )
  const [now, setNow] = useState(new Date())
  const todayRef = useRef<HTMLElement>(null)

  const todoIds = useMemo(
    () => todos.reduce((ids, todo) => ids.add(todo.id), new Set()),
    [todos]
  )

  // Update the now value every minute in case it changes the schedule
  useInterval(() => {
    setNow(new Date())
  }, 1000 * 60)

  // Regen forecast when necessary
  useEffect(() => {
    if (schedules.length > 0 && todos.length > 0) {
      setForecast(getForecast(schedules, todos, lastReset))
    } else {
      setForecast({
        days: [],
        maxTaskDuration: 0,
      })
    }
  }, [schedules, todos, lastReset])

  /*
  const uniqueIds = useMemo(() => {
    const ids = todos.reduce((ids, todo) => ids.add(todo.id), new Set())
    return ids.size
  }, [todos])

  console.log(uniqueIds, todos.length)
// */
  const onDismiss = () => {
    router.push(router.pathname, undefined, { shallow: true, scroll: false })
  }

  const somethingRecentlyCompleted = todos.some(
    (todo) => !todo.done && !!todo.completed
  )
  const withoutDuration = todos.filter((task) => task.duration < 1)
  const withoutSchedule = todos.filter(
    (todo) => todo.duration > forecast.maxTaskDuration
  )
  /*
  console.log({
    somethingRecentlyCompleted,
    withoutDuration,
    withoutSchedule,
    maxTaskDuration: forecast.maxTaskDuration,
  })
  // */

  let isThereToday = false

  return (
    <>
      {(withoutSchedule.length > 0 || withoutDuration.length > 0) && (
        <Section key="review fuckup" className="is-warning">
          <Header>Please review</Header>
          {withoutSchedule.length > 0 && (
            <div className={cx(styles.warning, 'px-inset')}>
              Your current settings allow a max duration of{' '}
              <strong>
                {forecast.maxTaskDuration}{' '}
                {forecast.maxTaskDuration === 1 ? 'minute' : 'minutes'}
              </strong>
              . The todos below have longer durations, either shorten them or
              update your{' '}
              <Link href="/schedules">
                <a className="hover:text-red-900 underline">Schedules</a>
              </Link>{' '}
              to allow more time.
            </div>
          )}

          <Items>
            {withoutSchedule.map((activity) => (
              <TodoItem
                key={activity.id}
                todo={{ ...activity, start: 'N/A', end: 'N/A' }}
                now={now}
                setTodos={setTodos}
                isToday={false}
              />
            ))}
          </Items>
          {withoutDuration.length > 0 && (
            <div className={cx(styles.warning, 'px-inset')}>
              The following todos couldn't be scheduled because their{' '}
              <strong>duration</strong> isn't specified.
            </div>
          )}
          {withoutDuration.map((activity) => (
            <TodoItem
              key={activity.id}
              todo={{ ...activity, start: 'N/A', end: 'N/A' }}
              now={now}
              setTodos={setTodos}
              isToday={false}
            />
          ))}
        </Section>
      )}
      {forecast.days?.map((day) => {
        if (!day.schedule?.some((pocket) => !!pocket.todos?.length)) {
          return null
        }

        const isToday = isSameDay(day.date, now)

        if (!isThereToday && isToday) {
          isThereToday = true
        }

        const dayText = isToday ? 'Today' : day.day
        const dateText = new Intl.DateTimeFormat(undefined, {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
        }).format(day.date)

        return (
          <Section
            key={day.date.toString()}
            ref={isToday ? todayRef : undefined}
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
      {somethingRecentlyCompleted && (
        <Button
          variant="primary"
          className="block mx-auto my-4"
          onClick={() => {
            setLastReset(new Date())
            setTodos((todos) =>
              todos.map((todo) => ({
                ...todo,
                done: todo.done || !!todo.completed,
              }))
            )
          }}
        >
          Archive Completed Todos
        </Button>
      )}
      {isThereToday && (
        <Button
          className="block mx-auto my-4"
          onClick={() => {
            setHyperfocus(!hyperfocusing)
            requestAnimationFrame(() => {
              ;(document.activeElement as HTMLElement)?.blur()
              todayRef.current?.scrollIntoView({ block: 'start' })
            })
          }}
        >
          {hyperfocusing ? 'Disable Hyperfocusing' : 'Enable Hyperfocusing'}
        </Button>
      )}
      <AnimatedDialog
        isOpen={!!router.query.create}
        onDismiss={onDismiss}
        aria-label="Create new todo"
      >
        <CreateDialog setTodos={setTodos} onDismiss={onDismiss} />
      </AnimatedDialog>
      <AnimatedDialog
        isOpen={!router.query.create && todoIds.has(router.query.edit)}
        onDismiss={onDismiss}
        aria-label="Edit todo"
      >
        <EditDialog
          onDismiss={onDismiss}
          setTodos={setTodos}
          todos={todos}
          id={router.query.edit as string}
        />
      </AnimatedDialog>
    </>
  )
}
