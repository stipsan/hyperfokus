/* eslint-disable no-restricted-globals */
import { BottomSheet } from 'react-spring-bottom-sheet'
import useInterval from '@use-it/interval'
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
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
import styles from './index.module.css'
import { useCallback, useDeferredValue, useTransition } from 'react'
import TagsSelect from 'components/TagsSelect'
import { useForecastComputer } from 'hooks/forecast'
import { ChangeEventHandler } from 'react'
import { TodosResource } from 'hooks/todos/demo'

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
  onDismiss,
  addTodo,
  editing,
  editTodo,
  deleteTodo,
  addTag,
  tags,
}: {
  addTodo?: AddTodo
  initialState?: Todo
  editing?: Todo
  editTodo?: EditTodo
  deleteTodo?: DeleteTodo
  onDismiss: (id?: string) => void
} & TagsSelectProps) => {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    created: new Date(),
    description: '',
    done: false,
    duration:
      parseInt(localStorage.getItem('hyperfokus.new-todo.duration'), 10) || 0,
    id: '',
    modified: undefined,
    order: parseInt(localStorage.getItem('hyperfokus.new-todo.order'), 10) || 1,
    //...(editing ? todosResource.read(editing) : {}),
    ...(editing || {}),
  }))

  useEffect(() => {
    if (editing) {
      dispatch({ type: 'reset', payload: editing })
    }
  }, [editing])

  const [selectedTags, setSelectedTags] = useState(() => state?.tags || [])
  const initialOrder = useRef(parseInt(state.order.toString(), 10))
  if (Number.isNaN(initialOrder.current)) initialOrder.current = 0

  const logException = useLogException()
  const analytics = useAnalytics()
  //console.log('editing.modified', editing?.modified)
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        const newState = { ...state, tags: selectedTags }

        // Persist a few default values
        if (!editing) {
          localStorage.setItem(
            'hyperfokus.new-todo.duration',
            JSON.stringify(newState.duration)
          )
          localStorage.setItem(
            'hyperfokus.new-todo.order',
            JSON.stringify(newState.order)
          )
          try {
            const { id } = await addTodo(newState)
            analytics.logEvent('todo_create', {
              duration: newState.duration,
              order: newState.order,
            })
            return onDismiss(id)
          } catch (err) {
            return logException(err)
          }
        }

        try {
          await editTodo(newState, editing.id)
          analytics.logEvent('todo_edit', {
            duration: state.duration,
            order: state.order,
          })
          onDismiss(editing.id)
        } catch (err) {
          logException(err)
        }
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
            <option value={initialOrder.current.toString()}>
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
      {editing?.modified && (
        <span className="text-xs text-gray-400 absolute top-0 right-0 pt-6 pr-4">
          Modified: {editing.modified.toLocaleTimeString()}
        </span>
      )}

      <DialogToolbar
        sticky={false}
        left={
          deleteTodo ? (
            <Button
              variant="danger"
              onClick={async () => {
                if (
                  confirm(
                    `Are you sure you want to delete "${state.description}"?`
                  )
                ) {
                  try {
                    await deleteTodo(editing.id)
                    onDismiss()
                    analytics.logEvent('todo_delete', {
                      duration: state.duration,
                      order: state.order,
                    })
                  } catch (err) {
                    logException(err)
                  }
                }
              }}
            >
              Delete
            </Button>
          ) : undefined
        }
        right={
          <>
            <Button variant="default" onClick={() => onDismiss(editing.id)}>
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

const TodoItem = memo(
  ({
    id,
    start,
    end,
    modified,
    isToday,
    now,
    completeTodo,
    incompleteTodo,
    displayTodoTagsOnItem,
    tags: allTags,
    setEditing,
    todosResource,
  }: {
    //ForecastTodo
    id: string
    start: string
    end: string
    modified: Date

    isToday: boolean
    now: Date
    completeTodo: CompleteTodo
    incompleteTodo: IncompleteTodo
    displayTodoTagsOnItem: boolean
    tags: Tags
    setEditing: React.Dispatch<React.SetStateAction<string>>
    todosResource: TodosResource
  }) => {
    const todo = useMemo(
      () => ({ id, start, end, modified, ...todosResource.read(id) }),
      [end, id, modified, start, todosResource]
    )

    const analytics = useAnalytics()
    const [isPending, startTransition] = useTransition()
    const logException = useLogException()
    const tags = useMemo<Tags>(
      () => allTags.filter((tag) => todo.tags?.includes(tag.id)),
      [allTags, todo.tags]
    )

    let isOverdue = false
    let isCurrent = false
    if (isToday) {
      let [endHours, endMinutes] = todo.end
        .split(':')
        .map((_) => parseInt(_, 10))
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

    const onClick = (event) => {
      event.stopPropagation()
      startTransition(() => {
        setEditing(todo.id)
      })
    }

    return (
      <li
        className={cx(styles.todo, 'cursor-pointer', {
          'is-current': isCurrent,
          'is-overdue': isOverdue,
          'animate-pulse': isPending,
        })}
        onClick={onClick}
      >
        <span
          className={cx(styles.time)}
          title={`Duration: ${todo.duration} minutes`}
        >
          {todo.start} – {todo.end}
        </span>

        <button
          className={cx('focus:outline-none px-inset-r text-left')}
          data-focus={todo.id}
          onClick={onClick}
        >
          {process.env.NODE_ENV !== 'production' && modified && (
            <span className="text-xs text-gray-400 ">
              Modified: {modified.toLocaleTimeString()}
            </span>
          )}
          <span className={styles.description}>
            {todo.description.trim()
              ? todo.description.replace(/^\n|\n$/g, '')
              : 'Untitled'}
          </span>
        </button>

        {(displayTodoTagsOnItem || process.env.NODE_ENV !== 'production') &&
          todo.tags?.length > 0 && (
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
    )
  }
)

const Header: FC<{ className?: string }> = ({ className, children }) => (
  <h3 className={cx('px-inset', styles.header, className)}>{children}</h3>
)

const CreateDialog = memo(
  ({
    onDismiss,
    addTodo,
    addTag,
    tags,
    creating,
    setCreating,
  }: {
    onDismiss: (id?: string) => void
    creating: boolean
    setCreating: React.Dispatch<React.SetStateAction<boolean>>
    addTodo
  } & TagsSelectProps) => {
    const analytics = useAnalytics()
    useEffect(() => {
      if (creating) {
        analytics.logEvent('screen_view', {
          app_name: process.env.NEXT_PUBLIC_APP_NAME,
          screen_name: 'New Todo',
        })
      }
    }, [creating, analytics])

    // TODO temp workaround
    const router = useRouter()
    useEffect(() => {
      if (router.query.create) {
        setCreating(true)
      } else {
        setCreating(false)
      }
    }, [router.query.create, setCreating])

    return (
      <BottomSheet
        open={creating}
        aria-label="Create new todo"
        onDismiss={onDismiss}
        // @TODO temp quickfix for z-index troubles, revisit when rsbs supports tw
        className="relative z-50"
        style={{
          ['--rsbs-max-w' as string]: '640px',
          ['--rsbs-ml' as string]: 'auto',
          ['--rsbs-mr' as string]: 'auto',
        }}
      >
        <div className="px-3">
          <TodoForm
            addTag={addTag}
            addTodo={addTodo}
            tags={tags}
            onDismiss={onDismiss}
          />
        </div>
      </BottomSheet>
    )
  }
)

const EditDialog = memo(
  ({
    onDismiss,
    id,
    editTodo,
    deleteTodo,
    addTag,
    tags,
    todosResource,
  }: {
    onDismiss: () => void
    id: string
    editTodo: EditTodo
    deleteTodo: DeleteTodo
    todosResource: TodosResource
  } & TagsSelectProps) => {
    const analytics = useAnalytics()
    const scrollTimeoutRef = useRef<ReturnType<typeof window.setTimeout>>()
    const open = !!id

    useEffect(() => {
      if (open && id) {
        analytics.logEvent('screen_view', {
          app_name: process.env.NEXT_PUBLIC_APP_NAME,
          screen_name: 'Edit Todo',
        })
      }
    }, [analytics, id, open])

    const onSpringStart = useCallback<
      ComponentProps<typeof AnimatedDialog>['onSpringStart']
    >(
      (event) => {
        if (event.type === 'CLOSE') {
          clearTimeout(scrollTimeoutRef.current)
          scrollTimeoutRef.current = setTimeout(() => {
            const focusNode = document.querySelector(
              `[data-focus="${id}"]`
            ) as HTMLElement
            if (focusNode) {
              focusNode.focus({ preventScroll: true })
              scrollIntoViewIfNeeded(focusNode, {
                scrollMode: 'if-needed',
                block: 'center',
              })
            }
          })
        }
      },
      [id]
    )

    const editing = id ? todosResource.read(id) : false
    const prevEditingRef = useRef<Todo | false>(editing)
    useEffect(() => {
      if (editing) {
        prevEditingRef.current = editing
      }
    }, [editing])
    const smartEditing = open ? editing : prevEditingRef.current

    return (
      <BottomSheet
        open={open}
        aria-label="Edit todo"
        onSpringStart={onSpringStart}
        onDismiss={onDismiss}
        // @TODO temp quickfix for z-index troubles, revisit when rsbs supports tw
        className="relative z-50"
        style={{
          ['--rsbs-max-w' as string]: '640px',
          ['--rsbs-ml' as string]: 'auto',
          ['--rsbs-mr' as string]: 'auto',
        }}
      >
        <div className="px-3">
          {smartEditing && (
            <TodoForm
              // TODO implement useImperativeHandle & useRef to solve the BottomSheet Toolbar propblem
              editing={smartEditing}
              addTag={addTag}
              tags={tags}
              onDismiss={onDismiss}
              editTodo={editTodo}
              deleteTodo={deleteTodo}
            />
          )}
        </div>
      </BottomSheet>
    )
  }
)

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
  setEditing,
  todosResource,
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
  setEditing: React.Dispatch<React.SetStateAction<string>>
  todosResource: TodosResource
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
                id={activity.id}
                start="N/A"
                end="N/A"
                now={now}
                modified={activity.modified}
                isToday={false}
                completeTodo={completeTodo}
                incompleteTodo={incompleteTodo}
                displayTodoTagsOnItem={displayTodoTagsOnItem}
                tags={tags}
                setEditing={setEditing}
                todosResource={todosResource}
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
              id={activity.id}
              start="N/A"
              end="N/A"
              modified={activity.modified}
              now={now}
              isToday={false}
              completeTodo={completeTodo}
              incompleteTodo={incompleteTodo}
              displayTodoTagsOnItem={displayTodoTagsOnItem}
              tags={tags}
              setEditing={setEditing}
              todosResource={todosResource}
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
                    id={task.id}
                    start={task.start}
                    end={task.end}
                    modified={task.modified}
                    isToday={isToday}
                    now={now}
                    completeTodo={completeTodo}
                    incompleteTodo={incompleteTodo}
                    displayTodoTagsOnItem={displayTodoTagsOnItem}
                    tags={tags}
                    setEditing={setEditing}
                    todosResource={todosResource}
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
                id={activity.id}
                start="N/A"
                end="N/A"
                modified={activity.modified}
                now={now}
                isToday={false}
                completeTodo={completeTodo}
                incompleteTodo={incompleteTodo}
                displayTodoTagsOnItem={displayTodoTagsOnItem}
                tags={tags}
                setEditing={setEditing}
                todosResource={todosResource}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  )
})

export default function TodosScreen({
  addTodo,
  archiveTodos,
  completeTodo,
  deleteTodo,
  editTodo,
  incompleteTodo,
  schedules: allSchedules,
  tags,
  todos: allTodos,
  addTag,
  todosResource,
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
  todosResource: TodosResource
} & TagsSelectProps) {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'Todos',
    })
  }, [analytics])

  const [hyperfocusing, setHyperfocus] = useState(false)
  /*
  const selectedTags = useMemo<Set<string>>(
    () => new Set([...[].concat(router.query.t || '')]),
    []
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
    [tags]
  )
  //*/
  ///*
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    () => new Set([...[].concat(router.query.t || '')])
  )
  // Lag to prevent URL syncing running too soon and introduce jank
  const laggingSelectedTags = useDeferredValue(selectedTags)
  useEffect(() => {
    router.push(
      {
        query: {
          ...router.query,
          t: [...laggingSelectedTags],
        },
      },
      undefined,
      { shallow: true }
    )
  }, [laggingSelectedTags])
  //*/

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

  // TODO combine creating and editing states into a useReducer thingy to make sure no invalid state combos can happen
  const [creating, setCreating] = useState(() => !!router.query.create)
  const [editing, setEditing] = useState<string>(() => {
    const [editId = ''] = [].concat(router.query.edit)
    return !router.query.create ? editId : ''
  })

  const displayTodoTagsOnItem =
    selectedTags.has('') || selectedTags.has('untagged') || !!router.query.dt

  // @TODO filter schedules based on tags
  const schedules = useMemo<Schedules>(
    () => allSchedules.filter((schedule) => schedule.enabled),
    [allSchedules]
  )

  const logException = useLogException()

  const [lastReset, setLastReset] = useState<Date>(() =>
    setSeconds(setMinutes(setHours(new Date(), 0), 0), 0)
  )

  const [computer, isComputing] = useForecastComputer(schedules, todos)

  const [_now, setNow] = useState(new Date())
  const now = useDeferredValue(_now)
  const todayRef = useRef<HTMLElement>(null)

  // Update the now value every minute in case it changes the schedule
  useInterval(() => {
    setNow(new Date())
  }, 1000 * 60)

  const onDismiss = useCallback(() => {
    setEditing('')
    setCreating(false)
    // Exclude edit and create args
    const { create, edit, ...query } = router.query
    router.push({ pathname: '/', query }, undefined, { shallow: true })
  }, [])

  const somethingRecentlyCompleted = useMemo(
    () => todos.some((todo) => !todo.done && !!todo.completed),
    [todos]
  )

  let isThereToday = false

  return (
    <>
      <TagsFilter
        tags={tags}
        selected={selectedTags}
        setSelected={setSelectedTags}
        isComputing={isComputing}
      />
      <CreateDialog
        creating={creating}
        setCreating={setCreating}
        addTodo={addTodo}
        addTag={addTag}
        tags={tags}
        onDismiss={onDismiss}
      />
      <EditDialog
        addTag={addTag}
        tags={tags}
        onDismiss={onDismiss}
        id={editing}
        editTodo={editTodo}
        deleteTodo={deleteTodo}
        todosResource={todosResource}
      />
      <Suspense
        fallback={
          <div className="flex h-screen -mt-2 items-center justify-center text-gray-700 text-xl w-screen loading">
            Loading...
          </div>
        }
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
          setEditing={setEditing}
          todosResource={todosResource}
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
