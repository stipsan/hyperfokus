/* eslint-disable no-restricted-globals */
import useInterval from '@use-it/interval'
import cx from 'classnames'
import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import type { Schedules } from 'hooks/schedules/types'
import type { Tags } from 'hooks/tags/types'
import type {
  Todos,
  AddTodo,
  EditTodo,
  DeleteTodo,
  CompleteTodo,
  IncompleteTodo,
  ArchiveTodos,
} from 'hooks/todos/types'
import TagsFilter from 'components/TagsFilter'
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
import router, { useRouter } from 'next/router'
import {
  ComponentProps,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { FC } from 'react'
import type { ForecastTodo } from 'utils/forecast'
import styles from './index.module.css'
import { useCallback } from 'react'
import TagsSelect from 'components/TagsSelect'
import { useForecastComputer } from 'hooks/forecast'
import { ChangeEventHandler } from 'react'
import * as React from 'react'
// workaround @types/react being out of date
const useDeferredValue: typeof React.unstable_useDeferredValue =
  // @ts-expect-error
  React.useDeferredValue
const useTransition: typeof React.unstable_useTransition =
  // @ts-expect-error
  React.useTransition

type TagsSelectProps = Omit<
  ComponentProps<typeof TagsSelect>,
  'selected' | 'setSelected'
>

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
  addTag,
  tags,
}: {
  initialState?: Todo
  editing?: boolean
  onDismiss: () => void
  onSubmit: (state: Todo) => void
  onDelete?: () => void
} & TagsSelectProps) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [selectedTags, setSelectedTags] = useState(
    () => initialState?.tags || []
  )
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

        onSubmit({ ...state, tags: selectedTags })
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

      <Field className="mt-4" label="Tags" htmlFor="tags">
        <TagsSelect
          tags={tags}
          addTag={addTag}
          selected={selectedTags}
          setSelected={setSelectedTags}
        />
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
        sticky={false}
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

const StyledCheckbox = memo(function StyledCheckbox({
  onChange,
  checked,
}: {
  onChange: ChangeEventHandler<HTMLInputElement>
  checked: boolean
}) {
  const nodeRef = useRef<HTMLInputElement>()
  useEffect(() => {
    if (nodeRef.current) {
      // Way more performant than going through the entire Forecast calculation first
      nodeRef.current.checked = checked
    }
  }, [checked])

  return (
    <label
      className={cx(styles.checkboxLabel, 'px-inset-l')}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        ref={nodeRef}
        className="form-checkbox"
        defaultChecked={checked}
        type="checkbox"
        onChange={onChange}
      />{' '}
    </label>
  )
})

const TodoItem: React.FC<{
  todo: ForecastTodo
  isToday: boolean
  now: Date
  completeTodo: CompleteTodo
  incompleteTodo: IncompleteTodo
  displayTodoTagsOnItem: boolean
  tags: Tags
}> = ({
  todo,
  isToday,
  now,
  completeTodo,
  incompleteTodo,
  displayTodoTagsOnItem,
  tags: allTags,
}) => {
  const analytics = useAnalytics()
  const logException = useLogException()
  const tags = useMemo<Tags>(
    () => allTags.filter((tag) => todo.tags?.includes(tag.id)),
    [allTags, todo.tags]
  )

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

  const handleCheckboxChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [analytics, completeTodo, incompleteTodo, logException, todo.id]
  )

  return (
    <Link href={{ query: { ...router.query, edit: todo.id } }} shallow>
      <li
        className={cx(styles.todo, 'cursor-pointer', {
          'is-current': isCurrent,
          'is-overdue': isOverdue,
        })}
      >
        <span
          className={cx(styles.time)}
          title={`Duration: ${todo.duration} minutes`}
        >
          {todo.start} – {todo.end}
        </span>
        <Link href={{ query: { ...router.query, edit: todo.id } }} shallow>
          <a
            className={cx(styles.description, 'focus:outline-none px-inset-r')}
            data-focus={todo.id}
          >
            {todo.description.trim()
              ? todo.description.replace(/^\n|\n$/g, '')
              : 'Untitled'}
          </a>
        </Link>
        {displayTodoTagsOnItem && todo.tags?.length > 0 && (
          <div className={cx(styles.tags, 'flex')}>
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs mr-1 my-1 px-2 py-1 block rounded-full bg-gray-200 bg-opacity-50 whitespace-pre"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <StyledCheckbox
          checked={!!todo.completed}
          onChange={handleCheckboxChange}
        />
      </li>
    </Link>
  )
}

const Header: FC<{ className?: string }> = ({ className, children }) => (
  <h3 className={cx('px-inset', styles.header, className)}>{children}</h3>
)

const CreateDialog = ({
  onDismiss,
  addTodo,
  addTag,
  tags,
}: {
  onDismiss: () => void
  addTodo
} & TagsSelectProps) => {
  const logException = useLogException()
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'New Todo',
    })
  }, [analytics])

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
      addTag={addTag}
      tags={tags}
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
  editTodo,
  deleteTodo,
  addTag,
  tags,
}: {
  todos: Todos
  onDismiss: () => void
  id: string
  editTodo: EditTodo
  deleteTodo: DeleteTodo
} & TagsSelectProps) => {
  const logException = useLogException()
  const analytics = useAnalytics()
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (id) {
      analytics.logEvent('screen_view', {
        app_name: process.env.NEXT_PUBLIC_APP_NAME,
        screen_name: 'Edit Todo',
      })
    }
  }, [analytics, id])

  const [initialState, setInitialState] = useState(null)

  useEffect(() => {
    const nextInitialState = todos.find((todo) => todo.id === id)
    if (nextInitialState) {
      setInitialState(nextInitialState)
    }
  }, [id, todos])

  const onSpringStart = useCallback<
    ComponentProps<typeof AnimatedDialog>['onSpringStart']
  >(
    (event) => {
      console.log(
        'onSpringStart',
        event.type,
        focusTimeoutRef.current,
        id,
        initialState?.id
      )
      clearTimeout(focusTimeoutRef.current)
      if (event.type === 'CLOSE') {
        focusTimeoutRef.current = setTimeout(() => {
          const focusNode = document.querySelector(
            `a[data-focus="${id}"]`
          ) as HTMLElement
          // @ts-expect-error
          focusNode?.focus({ behavior: 'smooth' })
          console.log('calling focus!', { id }, initialState?.id)
        })
      }
    },
    [id, initialState?.id]
  )

  return (
    <AnimatedDialog
      isOpen={initialState && id !== ''}
      onDismiss={onDismiss}
      aria-label="Edit todo"
      onSpringStart={onSpringStart}
    >
      <TodoForm
        editing
        addTag={addTag}
        tags={tags}
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
    </AnimatedDialog>
  )
}

const ForecastDisplay = memo(function ForecastDisplay({
  completeTodo,
  computer,
  displayTodoTagsOnItem,
  hyperfocusing,
  incompleteTodo,
  isThereToday,
  lastReset,
  now,
  tags,
  todayRef,
}: {
  completeTodo: CompleteTodo
  computer: ReturnType<typeof useForecastComputer>[0]
  displayTodoTagsOnItem: boolean
  hyperfocusing: boolean
  incompleteTodo: IncompleteTodo
  isThereToday: boolean
  lastReset: Date
  now: Date
  tags: Tags
  todayRef: React.MutableRefObject<HTMLElement>
}) {
  const [deadlineMs, setDeadlineMs] = useState(16)
  const { days, maxTaskDuration, timedout, withoutSchedule, withoutDuration } =
    computer.read(lastReset, deadlineMs)

  return (
    <>
      {(withoutSchedule.length > 0 || withoutDuration.length > 0) && (
        <section
          key="review fuckup"
          className={cx(styles.section, 'is-warning')}
        >
          <Header>Please review</Header>
          {withoutSchedule.length > 0 && (
            <div
              className={cx(
                styles.warning,
                'ml-6 bg-red-200 rounded-l py-1 mb-1  px-inset'
              )}
            >
              Your current settings allow a max duration of{' '}
              <strong>
                {maxTaskDuration} {maxTaskDuration === 1 ? 'minute' : 'minutes'}
              </strong>
              . The todos below have longer durations, either shorten them or
              update your{' '}
              <Link href="/schedules">
                <a className="hover:text-red-900 underline">Schedules</a>
              </Link>{' '}
              to allow more time.
            </div>
          )}

          <ul className={styles.items}>
            {withoutSchedule.map((activity) => (
              <TodoItem
                key={activity.id}
                todo={{ ...activity, start: 'N/A', end: 'N/A' }}
                now={now}
                isToday={false}
                completeTodo={completeTodo}
                incompleteTodo={incompleteTodo}
                displayTodoTagsOnItem={displayTodoTagsOnItem}
                tags={tags}
              />
            ))}
          </ul>
          {withoutDuration.length > 0 && (
            <div
              className={cx(
                styles.warning,
                'ml-6 bg-red-200 rounded-l py-1 mb-1 px-inset'
              )}
            >
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
              completeTodo={completeTodo}
              incompleteTodo={incompleteTodo}
              displayTodoTagsOnItem={displayTodoTagsOnItem}
              tags={tags}
            />
          ))}
        </section>
      )}
      {days.map((day) => {
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
          <section
            key={day.date.toString()}
            ref={isToday ? todayRef : undefined}
            className={cx(styles.section, {
              'is-today': isToday,
              'is-hyperfocus': hyperfocusing,
            })}
          >
            <Header>
              <span className="font-bold block mr-1">{dayText}</span> {dateText}
            </Header>
            <ul className={styles.items}>
              {day.schedule.map((pocket) =>
                pocket.todos?.map((task) => (
                  <TodoItem
                    key={task.id}
                    todo={task}
                    isToday={isToday}
                    now={now}
                    completeTodo={completeTodo}
                    incompleteTodo={incompleteTodo}
                    displayTodoTagsOnItem={displayTodoTagsOnItem}
                    tags={tags}
                  />
                ))
              )}
            </ul>
          </section>
        )
      })}
      {timedout.length > 0 && (
        <section key="timedout" className={cx(styles.section)}>
          <Header>
            <span className="font-bold block">Someday</span>
          </Header>
          {deadlineMs < 300 ? (
            <div
              key="try again"
              className={cx(
                styles.warning,
                'ml-6 bg-orange-200 rounded-l py-1 mb-1 px-inset'
              )}
            >
              Despite best efforts I couldn't squeeze all your todos into your
              schedule.{' '}
              <button
                className="ml-1 px-2 py-1 text-sm text-orange-800 hover:text-orange-900 rounded-md bg-orange-100 hover:bg-orange-300"
                onClick={() => setDeadlineMs(300)}
              >
                Go deeper.
              </button>
            </div>
          ) : (
            <div
              key="give up"
              className={cx(
                styles.warning,
                'ml-6 bg-orange-200 rounded-l py-1 mb-1 px-inset'
              )}
            >
              One day, a beautiful 🌤️ shiny day, you'll have time to do that
              thing you always wanted to do...
            </div>
          )}
          <ul className={styles.items}>
            {timedout.map((activity) => (
              <TodoItem
                key={activity.id}
                todo={{ ...activity, start: 'N/A', end: 'N/A' }}
                now={now}
                isToday={false}
                completeTodo={completeTodo}
                incompleteTodo={incompleteTodo}
                displayTodoTagsOnItem={displayTodoTagsOnItem}
                tags={tags}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  )
})

export default function TodosScreen({
  addTodo: addTodoUnsafe,
  archiveTodos,
  completeTodo,
  deleteTodo,
  editTodo: editTodoUnsafe,
  incompleteTodo,
  schedules: allSchedules,
  tags,
  todos: allTodos,
  addTag,
}: {
  addTodo: AddTodo
  archiveTodos: ArchiveTodos
  completeTodo: CompleteTodo
  deleteTodo: DeleteTodo
  editTodo: EditTodo
  incompleteTodo: IncompleteTodo
  schedules: Schedules
  tags: Tags
  todos: Todos
} & TagsSelectProps) {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'Todos',
    })
  }, [analytics])

  const addTodo = useCallback<AddTodo>(
    ({ description, ...todo }) =>
      addTodoUnsafe({ ...todo, description: description.substring(0, 2048) }),
    [addTodoUnsafe]
  )
  const editTodo = useCallback<EditTodo>(
    ({ description, ...todo }, id) =>
      editTodoUnsafe(
        {
          ...todo,
          description: description.substring(0, 2048),
          modified: new Date(),
        },
        id
      ),
    [editTodoUnsafe]
  )

  const router = useRouter()
  const [hyperfocusing, setHyperfocus] = useState(false)
  const selectedTags = useMemo<Set<string>>(
    () => new Set([...[].concat(router.query.t || '')]),
    [router.query.t]
  )
  const setSelectedTags = useCallback<
    (nextSelected: typeof selectedTags) => void
  >(
    (nextSelected) =>
      router.push(
        {
          query: {
            ...router.query,
            t:
              nextSelected.size > 0
                ? [...nextSelected].filter(
                    (id) =>
                      id === 'untagged' || tags.some((tag) => tag.id === id)
                  )
                : '',
          },
        },
        undefined,
        { shallow: true }
      ),
    [router, tags]
  )
  /*
  const [selectedTags, setSelectedTags] = useState<Set<string | boolean>>(
    () => new Set()
  )
  */
  const displayTodoTagsOnItem =
    selectedTags.has('') || selectedTags.has('untagged') || !!router.query.dt

  // @TODO filter schedules based on tags
  const schedules = useMemo<Schedules>(
    () => allSchedules.filter((schedule) => schedule.enabled),
    [allSchedules]
  )

  // @TODO send tags filter to hook
  const todos = useMemo(() => {
    if (selectedTags.has('')) {
      return allTodos
    }

    return allTodos.filter((todo) => {
      // if Untagged, check if tags are emty, or empty array
      // Else if check if value exists in array
      if (
        selectedTags.has('untagged') &&
        (!todo.tags || todo.tags?.length === 0)
      ) {
        return true
      }

      if (todo.tags?.some((tag) => selectedTags.has(tag))) {
        return true
      }

      return false
    })
  }, [allTodos, selectedTags])
  const logException = useLogException()

  const [lastReset, setLastReset] = useState<Date>(() =>
    setSeconds(setMinutes(setHours(new Date(), 0), 0), 0)
  )

  const [computer, isComputing] = useForecastComputer(schedules, todos)

  const [_now, setNow] = useState(new Date())
  const now = useDeferredValue(_now)
  const todayRef = useRef<HTMLElement>(null)

  const todoIds = useMemo(
    () => allTodos.reduce((ids, todo) => ids.add(todo.id), new Set()),
    [allTodos]
  )

  // Update the now value every minute in case it changes the schedule
  useInterval(() => {
    setNow(new Date())
  }, 1000 * 60)

  /*
  const uniqueIds = useMemo(() => {
    const ids = todos.reduce((ids, todo) => ids.add(todo.id), new Set())
    return ids.size
  }, [todos])

  console.log(uniqueIds, todos.length)
// */
  const onDismiss = () => {
    // Exclude edit and create args
    const { create, edit, ...query } = router.query
    router.push({ pathname: '/', query }, undefined, { shallow: true })
  }

  const somethingRecentlyCompleted = todos.some(
    (todo) => !todo.done && !!todo.completed
  )

  let isThereToday = false
  const [editId = ''] = [].concat(router.query.edit)

  // Defer some expensive things
  //const deferredComputer = useDeferredValue(computer)
  //const deferredIsComputing = useDeferredValue(isComputing)

  return (
    <>
      <TagsFilter
        tags={tags}
        selected={selectedTags}
        setSelected={setSelectedTags}
        isComputing={isComputing}
      />
      <AnimatedDialog
        isOpen={!!router.query.create}
        onDismiss={onDismiss}
        aria-label="Create new todo"
      >
        <CreateDialog
          addTodo={addTodo}
          addTag={addTag}
          tags={tags}
          onDismiss={onDismiss}
        />
      </AnimatedDialog>
      <EditDialog
        addTag={addTag}
        tags={tags}
        onDismiss={onDismiss}
        todos={allTodos}
        id={!router.query.create && todoIds.has(editId) ? editId : ''}
        editTodo={editTodo}
        deleteTodo={deleteTodo}
      />
      <Suspense
        fallback={
          <div className="flex h-screen -mt-2 items-center justify-center text-gray-700 text-xl w-screen loading">
            Loading...
          </div>
        }
        // Calculating the first forecast is really CPU intensive
        //unstable_expectedLoadTime={3000}
      >
        <ForecastDisplay
          completeTodo={completeTodo}
          computer={computer}
          displayTodoTagsOnItem={displayTodoTagsOnItem}
          hyperfocusing={hyperfocusing}
          incompleteTodo={incompleteTodo}
          isThereToday={isThereToday}
          lastReset={lastReset}
          now={now}
          tags={tags}
          todayRef={todayRef}
        />
      </Suspense>
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
