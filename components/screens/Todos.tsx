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
import { forwardRef, useEffect, useState } from 'react'
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react'
import { replaceItemAtIndex } from 'utils/array'
import { getForecast } from 'utils/forecast'
import type { Forecast, ForecastTodo } from 'utils/forecast'
import styles from './Todos.module.css'

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
const EditDialog = () => {
  const router = useRouter()

  const close = () => {
    router.push(router.pathname, undefined, { shallow: true, scroll: false })
  }

  return (
    <AnimatedDialog
      isOpen={!!router.query.edit}
      onDismiss={close}
      aria-label="Edit todo"
    >
      <p className="py-16 text-center">
        The ability to edit todos are on its way!
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
      <EditDialog />
    </>
  )
}
