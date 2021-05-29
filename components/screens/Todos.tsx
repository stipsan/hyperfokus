import useInterval from '@use-it/interval'
import cx from 'classnames'
import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import TagsFilter from 'components/TagsFilter'
import { useActiveSchedules } from 'components/SchedulesProvider'
import { useTodos, useTodosDispatch } from 'components/TodosProvider'
import TagsProvider from 'components/TagsProvider'
import type { Todo } from 'database/types'
import {
  isAfter,
  isBefore,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns'
import { useAnalytics, useLogException } from 'hooks/analytics'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { FC, ReactNode } from 'react'
import { getForecast } from 'utils/forecast'
import type { Forecast, ForecastTodo } from 'utils/forecast'
import styles from './Todos.module.css'
import { tags } from 'database/demo'

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
    description: '',
    done: false,
    duration:
      parseInt(localStorage.getItem('hyperfokus.new-todo.duration'), 10) || 0,
    id: '',
    modified: undefined,
    order: parseInt(localStorage.getItem('hyperfokus.new-todo.order'), 10) || 1,
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
  let initialOrder = parseInt(initialState.order.toString(), 10)
  if (Number.isNaN(initialOrder)) initialOrder = 0

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        // Persist a few default values
        if (!editing) {
          localStorage.setItem(
            'hyperfokus.new-todo.duration',
            JSON.stringify(state.duration)
          )
          localStorage.setItem(
            'hyperfokus.new-todo.order',
            JSON.stringify(state.order)
          )
        }

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
              // @TODO rewrite reorder signals to use enum strings instead of numbers to signal sorting
              dispatch({
                type: 'change',
                payload: {
                  name: 'order',
                  value: parseInt(event.target.value, 10),
                },
              })
            }
          >
            <option value={initialOrder.toString()}>
              Keep current ordering
            </option>
            <option value={-1}>Move to the top</option>
            <option value={1}>Move to the bottom</option>
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
}> = ({ todo, isToday, now }) => {
  const analytics = useAnalytics()
  const logException = useLogException()
  const { completeTodo, incompleteTodo } = useTodosDispatch()
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
      <Link key="time" href={`?edit=${todo.id}`} shallow>
        <Time title={`Duration: ${todo.duration} minutes`}>
          {todo.start} – {todo.end}
        </Time>
      </Link>
      <Link key="description" href={`?edit=${todo.id}`} shallow>
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
        onChange={async (event) => {
          const { checked } = event.target
          try {
            if (checked) {
              await completeTodo(todo.id)
            } else {
              await incompleteTodo(todo.id)
            }

            analytics.logEvent('todo_toggle', { completed: checked })
          } catch (err) {
            logException(err)
          }
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

const CreateDialog = ({ onDismiss }: { onDismiss: () => void }) => {
  const logException = useLogException()
  const { addTodo } = useTodosDispatch()
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'New Todo',
    })
  }, [])

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
      onSubmit={async (state) => {
        try {
          const { id } = await addTodo(state)
          idRef.current = id
          onDismiss()
          analytics.logEvent('todo_create', {
            duration: state.duration,
            order: state.order,
          })
        } catch (err) {
          logException(err)
        }
      }}
    />
  )
}

const EditDialog = ({
  todos,
  onDismiss,
  id,
}: {
  todos: Todo[]
  onDismiss: () => void
  id: string
}) => {
  const logException = useLogException()
  const { editTodo, deleteTodo } = useTodosDispatch()
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'Edit Todo',
    })
  }, [])

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
      onSubmit={async (state) => {
        try {
          await editTodo(state, id)
          setInitialState(state)
          onDismiss()
          analytics.logEvent('todo_edit', {
            duration: state.duration,
            order: state.order,
          })
        } catch (err) {
          logException(err)
        }
      }}
      onDelete={async () => {
        if (
          confirm(
            `Are you sure you want to delete "${initialState.description}"?`
          )
        ) {
          try {
            await deleteTodo(id)
            onDismiss()
            analytics.logEvent('todo_delete', {
              duration: initialState.duration,
              order: initialState.order,
            })
          } catch (err) {
            logException(err)
          }
        }
      }}
    />
  )
}

export default function TodosScreen() {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'Todos',
    })
  }, [])

  const router = useRouter()
  const [hyperfocusing, setHyperfocus] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string | boolean>>(
    () => new Set()
  )
  // @TODO filter schedules based on tags
  const schedules = useActiveSchedules()
  // @TODO send tags filter to hook
  const allTodos = useTodos()
  const todos = useMemo(() => {
    if (selectedTags.size === 0) {
      return allTodos
    }

    return allTodos.filter((todo) => {
      // if Untagged, check if tags are emty, or empty array
      // Else if check if value exists in array
      if (selectedTags.has(true) && (!todo.tags || todo.tags?.length === 0)) {
        return true
      }

      if (todo.tags?.some((tag) => selectedTags.has(tag))) {
        return true
      }

      return false
    })
  }, [allTodos, selectedTags])
  const { archiveTodos } = useTodosDispatch()
  const logException = useLogException()

  const [lastReset, setLastReset] = useState<Date>(() =>
    setSeconds(setMinutes(setHours(new Date(), 0), 0), 0)
  )
  const [forecast, setForecast] = useState<Forecast>(() =>
    getForecast(schedules, todos, lastReset)
  )
  const [now, setNow] = useState(new Date())
  const todayRef = useRef<HTMLElement>(null)

  const todoIds = useMemo(
    () => allTodos.reduce((ids, todo) => ids.add(todo.id), new Set()),
    [allTodos]
  )

  // Update the now value every minute in case it changes the schedule
  useInterval(() => {
    setNow(new Date())
  }, 1000 * 60)

  // Regen forecast when necessary
  useLayoutEffect(() => {
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
    router.push(router.pathname, undefined, { shallow: true })
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
      <TagsProvider>
        <TagsFilter selected={selectedTags} setSelected={setSelectedTags} />
        <AnimatedDialog
          isOpen={!!router.query.create}
          onDismiss={onDismiss}
          aria-label="Create new todo"
        >
          <CreateDialog onDismiss={onDismiss} />
        </AnimatedDialog>
        <AnimatedDialog
          isOpen={!router.query.create && todoIds.has(router.query.edit)}
          onDismiss={onDismiss}
          aria-label="Edit todo"
        >
          <EditDialog
            onDismiss={onDismiss}
            todos={todos}
            id={router.query.edit as string}
          />
        </AnimatedDialog>
      </TagsProvider>
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
              <span className="font-bold block mr-1">{dayText}</span> {dateText}
            </Header>
            <Items>
              {day.schedule.map((pocket) =>
                pocket.todos?.map((task) => (
                  <TodoItem
                    key={task.id}
                    todo={task}
                    isToday={isToday}
                    now={now}
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
          onClick={async () => {
            try {
              await archiveTodos()
              setLastReset(new Date())
              analytics.logEvent('todo_archive')
            } catch (err) {
              logException(err)
            }
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
            analytics.logEvent(
              hyperfocusing ? 'hyperfocusing_stop' : 'hyperfocusing_start'
            )
          }}
        >
          {hyperfocusing ? 'Disable Hyperfocusing' : 'Enable Hyperfocusing'}
        </Button>
      )}
    </>
  )
}
