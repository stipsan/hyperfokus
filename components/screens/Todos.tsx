import cx from 'classnames'
import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import { isSameDay } from 'date-fns'
import { useDatabase } from 'hooks/database'
import { useGetSchedules } from 'hooks/schedules'
import { useGetTodos } from 'hooks/todos'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { getForecast } from 'utils/forecast'
import type { Forecast, ForecastTodo } from 'utils/forecast'

const CheckboxLabel: FC<{ onClick: (event: any) => void }> = ({
  children,
  onClick,
}) => <label onClick={onClick}>{children}</label>
/*
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  align-self: stretch;
  padding: 2px 8px;
`
// */

const Time: FC<{ title?: string }> = ({ children, title }) => (
  <span title={title}>{children}</span>
)
/*
const Time = styled.span`
  float: right;
  font-variant-numeric: tabular-nums;
  padding: 2px 8px;
  font-weight: 600;
  font-size: 0.8em;
`
// */

const StyledCheckbox: React.FC<{
  onChange: (event: any) => void
  onClick: (event: any) => void
  checked?: boolean
}> = ({ onClick, ...props }) => {
  return (
    <CheckboxLabel onClick={onClick}>
      <input type="checkbox" {...props} />
    </CheckboxLabel>
  )
}
// */

const Description: FC = ({ children }) => <div>{children}</div>
/*
const Description = styled.div`
  padding: 6px 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
// */

const Item: FC<{ onClick: () => void }> = ({ children, onClick }) => (
  <li className="flex items-center relative w-full" onClick={onClick}>
    {children}
  </li>
)

type ActivityProps = {
  activity: ForecastTodo
}
const ActivityItem: React.FC<ActivityProps> = ({ activity }) => {
  const [open, setOpen] = useState(false)

  return (
    <Item onClick={() => setOpen(true)}>
      <StyledCheckbox
        checked={!!activity.completed}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          alert('Not implemented!')
          /*
            event.target.checked
              ? database.completeActivity(areaId, activity.id)
              : database.incompleteActivity(areaId, activity.id)
              // */
        }}
      />
      <Description>{activity.description}</Description>
      <Time title={`Duration: ${activity.duration}m`}>
        {activity.start} – {activity.end}
      </Time>
    </Item>
  )
}
// */

const Items: FC<{ isToday?: boolean }> = ({ children }) => <ul>{children}</ul>
/*
const Items = styled.ul<{ isToday?: boolean }>`
  .is-today > & {
    position: sticky;
    // @TODO make the top property be a measurement of <Header> so it's not static, but can respond to things like text size changes
    top: 29px;
  }
`
// */

const Header: FC<{ isToday?: boolean }> = ({ children, isToday }) => (
  <h3>{children}</h3>
)
/*
const Header = styled.h3<{ isToday?: boolean }>`
  font-size: 17px;
  font-weight: 600;
  padding: 2px 8px;
  text-transform: uppercase;
  position: sticky;
  top: 0px;
  z-index: 1;
  background-color: hsl(0, 0%, 97%);
  color: ${props => (props.isToday ? '#3273dc' : 'black')};
`
// */

const Section: FC<{ className?: string }> = ({ children, className }) => (
  <section className={cx('bg-white', className)}>{children}</section>
)
/*
const Section = styled.section<{ className?: string }>`
  background: white;

  &.is-today {
    min-height: calc(var(--viewport-height) - 120px);
  }
`
// */

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

// @TODO temporary workaround, go grab useLastAreaReset from v2
const lastReset = new Date()

export default () => {
  const database = useDatabase()
  const schedules = useGetSchedules()
  const [todos, setTodos] = useState(useGetTodos())
  const [forecast, setForecast] = useState<Forecast>({
    days: [],
    maxTaskDuration: 0,
  })

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

  const now = new Date()

  console.log({ schedules, todos, forecast, lastReset })

  return (
    <>
      {forecast.days?.map((day) => {
        if (!day.schedule?.some((pocket) => !!pocket.todos?.length)) {
          return null
        }

        const isToday = isSameDay(day.date, now)

        return (
          <Section
            key={day.date.toString()}
            className={cx({ 'is-today': isToday })}
          >
            <Header isToday={isToday}>
              {isToday ? 'Today' : day.day}{' '}
              {new Intl.DateTimeFormat(undefined, {
                year: '2-digit',
                month: 'numeric',
                day: 'numeric',
              }).format(day.date)}
            </Header>
            <Items isToday={isToday}>
              {day.schedule.map((pocket) =>
                pocket.todos?.map((task) => (
                  <ActivityItem key={task.id} activity={task} />
                ))
              )}
            </Items>
          </Section>
        )
      })}
      <CreateDialog />
    </>
  )
}
