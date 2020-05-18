import cx from 'classnames'
import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import type { Schedule } from 'database/types'
import { useDatabase } from 'hooks/database'
import { useGetSchedules } from 'hooks/schedules'
import { useSessionValue } from 'hooks/session'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useReducer, useState } from 'react'
import type { Dispatch, FC, SetStateAction } from 'react'
import { getRepeatMessage, sortByHoursMinutesString } from 'utils/time'

const title = 'Schedules'

let id = 0
const CreateDialog = ({
  setSchedules,
}: {
  setSchedules: Dispatch<SetStateAction<Schedule[]>>
}) => {
  const router = useRouter()
  const close = () => {
    router.push(router.pathname)
  }

  return (
    <AnimatedDialog
      isOpen={!!router.query.create}
      onDismiss={close}
      aria-label="Create new schedule"
    >
      <ScheduleForm
        onDismiss={close}
        onSubmit={(state) => {
          setSchedules((schedules) => {
            return [...schedules, { ...state, id: `new-schedule-${++id}` }]
          })
          close()
        }}
      />
    </AnimatedDialog>
  )
}

const getMinutesFromTime = (time: string) => {
  const [hours, minutes] = time.split(':')

  return parseInt(hours, 10) * 60 + parseInt(minutes, 10)
}

const getDuration = (state: TimeState) => {
  if (!state.start.match(/\:/) || !state.end.match(/\:/)) {
    return state.duration
  }

  const startMinutes = getMinutesFromTime(state.start)
  const endMinutes = getMinutesFromTime(state.end)

  return startMinutes < endMinutes
    ? endMinutes - startMinutes
    : startMinutes - endMinutes
}

const getEnd = (state: TimeState) => {
  if (!state.start.match(/\:/) || !state.duration) {
    return state.end
  }

  const startMinutes = getMinutesFromTime(state.start)
  const endMinutes = startMinutes + state.duration
  const endHours = Math.floor(endMinutes / 60)

  return `${endHours.toString().padStart(2, '0')}:${(endMinutes - endHours * 60)
    .toString()
    .padStart(2, '0')}`
}

type FormActions =
  | { type: 'reset'; payload: TimeState }
  | { type: 'change'; payload: { name: string; value: unknown } }
  | { type: 'blur:start' }
  | { type: 'blur:duration' }
  | { type: 'blur:end' }
  | { type: 'change:enabled'; payload: { value: boolean } }
  | { type: 'change:snapshot'; payload: TimeState }
function reducer(state: TimeState, action: FormActions) {
  switch (action.type) {
    case 'reset':
      return action.payload
    case 'change':
      return { ...state, [action.payload.name]: action.payload.value }
    case 'blur:start':
      return { ...state, end: getEnd(state) }
    case 'blur:duration':
      return { ...state, end: getEnd(state) }
    case 'blur:end':
      return { ...state, duration: getDuration(state) }
    case 'change:enabled':
      return { ...state, enabled: action.payload.value, after: new Date() }
    case 'change:snapshot':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

type TimeState = {
  id: string
  start: string
  duration: number
  end: string
  repeat: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  enabled: boolean
  after: Date
}

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

const StartTime = ({
  dispatch,
  state,
}: {
  dispatch: Function
  state: TimeState
}) => (
  <input
    required
    className="tnum form-input mt-1 block"
    type="time"
    autoComplete="off"
    id="start"
    pattern="(0?[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])"
    placeholder="09:00"
    name="start"
    style={{ minWidth: '8ch', height: '42px' }}
    //min="00:00"
    //max={state.end}
    value={state.start}
    onChange={({ target: { name, value } }) =>
      dispatch({ type: 'change', payload: { name, value } })
    }
    onBlur={() => dispatch({ type: 'blur:start' })}
  />
)

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
      style={{ width: '8ch' }}
      required
      autoComplete="off"
      className="form-input rounded-r-none z-10 tnum"
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

const EndTime = ({
  dispatch,
  state,
}: {
  dispatch: Function
  state: {
    end: string
  }
}) => (
  <input
    required
    /*
    css={`
      font-variant-numeric: tabular-nums;
      font-feature-settings: 'tnum';
      width: auto;
    `}
    // */
    autoComplete="off"
    id="end"
    type="time"
    className="tnum form-input block mt-1"
    pattern="(0?[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])"
    placeholder="10:00"
    style={{ minWidth: '8ch', height: '42px' }}
    name="end"
    value={state.end}
    onChange={({ target: { name, value } }) =>
      dispatch({ type: 'change', payload: { name, value } })
    }
    onBlur={() => dispatch({ type: 'blur:end' })}
  />
)

type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const Repeat = ({
  dispatch,
  state,
}: {
  dispatch: Function
  state: { repeat: { [key: string]: boolean } }
}) => (
  <>
    {WEEKDAYS.map((weekday) => (
      <label
        key={weekday}
        className="inline-flex items-center col-gap-2 mb-2 rounded bg-gray-100 px-2"
        /*
        css={`
          margin: 0.6em 0.5em 0.6em 0;
        `}
        // */
      >
        <input
          className="form-checkbox"
          type="checkbox"
          name="repeat"
          checked={state.repeat[weekday]}
          onChange={({ target: { checked } }) =>
            dispatch({
              type: 'change',
              payload: {
                name: 'repeat',
                value: {
                  ...state.repeat,
                  [weekday]: checked,
                },
              },
            })
          }
        />
        <span>{weekday}</span>
      </label>
    ))}
  </>
)

const ScheduleForm = ({
  initialState = {
    id: '',
    start: '',
    duration: 0,
    end: '',
    repeat: WEEKDAYS.reduce(
      (prev, next) => ({ ...prev, [next]: false }),
      {}
    ) as TimeState['repeat'],
    after: new Date(),
    enabled: true,
  },
  onDismiss,
  onSubmit,
  editing,
  onDelete,
}: {
  initialState?: Schedule
  editing?: boolean
  onDismiss: () => void
  onSubmit: (state: TimeState) => void
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
      <div className="flex flex-wrap col-gap-4">
        <Field className="mb-4" label="Start" htmlFor="start">
          <StartTime dispatch={dispatch} state={state} />
        </Field>

        <Field className="mb-4" label="Duration" htmlFor="duration">
          <Duration dispatch={dispatch} state={state} />
        </Field>

        <Field className="mb-4" label="End" htmlFor="end">
          <EndTime dispatch={dispatch} state={state} />
        </Field>
      </div>

      <div className="block">
        <span className="text-gray-700">Repeat</span>
        <div className="mt-1 flex flex-wrap col-gap-2">
          <Repeat dispatch={dispatch} state={state} />
        </div>
      </div>

      {editing && (
        <div className="block mt-2">
          <span className="text-gray-700">Enabled</span>
          <div className="mt-1 flex col-gap-4">
            <label className="inline-flex col-gap-2 items-center">
              <input
                type="radio"
                className="form-radio"
                name="enabled"
                value="yes"
                checked={state.enabled}
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
            <label className="inline-flex col-gap-2 items-center">
              <input
                type="radio"
                className="form-radio"
                name="enabled"
                value="no"
                checked={!state.enabled}
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

const EditDialog = ({
  schedules,
  setSchedules,
}: {
  schedules: Schedule[]
  setSchedules: Dispatch<SetStateAction<Schedule[]>>
}) => {
  const router = useRouter()
  const [initialState, setInitialState] = useState(() =>
    schedules.find((schedule) => schedule.id === router.query.edit)
  )

  useEffect(() => {
    if (router.query.edit) {
      const nextInitialState = schedules.find(
        (schedule) => schedule.id === router.query.edit
      )
      if (nextInitialState) {
        setInitialState(nextInitialState)
      }
    }
  }, [router.query.edit])

  const close = () => {
    router.push(router.pathname)
  }

  return (
    <AnimatedDialog
      isOpen={
        !!router.query.edit &&
        !!initialState &&
        router.query.edit === initialState.id
      }
      onDismiss={close}
      aria-label="Edit schedule"
    >
      <ScheduleForm
        editing
        initialState={initialState}
        onDismiss={close}
        onSubmit={(state) => {
          setSchedules((schedules) => {
            const index = schedules.findIndex(
              (schedule) => schedule.id === initialState.id
            )

            const newSchedules = replaceItemAtIndex(schedules, index, {
              ...schedules[index],
              start: state.start,
              duration: state.duration,
              end: state.end,
              repeat: state.repeat,
              enabled: state.enabled,
            })
            return newSchedules
          })
          setInitialState(state)
          close()
        }}
        onDelete={() => {
          if (
            confirm(
              `Are you sure you want to delete "${initialState.start} – ${
                initialState.end
              }, ${getRepeatMessage(initialState.repeat)}"?`
            )
          ) {
            setSchedules((schedules) => {
              const index = schedules.findIndex(
                (schedule) => schedule.id === initialState.id
              )
              const newSchedules = removeItemAtIndex(schedules, index)
              return newSchedules
            })
            close()
          }
        }}
      />
    </AnimatedDialog>
  )
}

function replaceItemAtIndex(
  arr: Schedule[],
  index: number,
  newValue: Schedule
) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
}

function removeItemAtIndex(arr: Schedule[], index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

const SchedulesList = () => {
  const database = useDatabase()
  const [schedules, setSchedules] = useState(useGetSchedules())
  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) =>
      sortByHoursMinutesString(a.start, b.start)
    )
  }, [schedules])

  // Sync with db
  useEffect(() => {
    database.setSchedules(schedules)
  }, [schedules])

  return (
    <div className="border-b-2">
      {sortedSchedules.map((schedule) => {
        const metaInformation = [`${schedule.duration} minutes`]
        const repeatMessage = getRepeatMessage(schedule.repeat)
        if (repeatMessage) metaInformation.push(repeatMessage)

        return (
          <Link
            key={schedule.id}
            href={`?edit=${schedule.id}`}
            shallow
            scroll={false}
          >
            <a className="block px-inset py-6 hover:bg-gray-200 focus:bg-gray-100 active:bg-gray-200 focus:outline-none border-t-2">
              <div className="text-3xl tnum">{`${schedule.start} – ${schedule.end}`}</div>
              <div>{metaInformation.join(', ')}</div>
              {!schedule.enabled && <div>Disabled</div>}
            </a>
          </Link>
        )
      })}
      <EditDialog schedules={schedules} setSchedules={setSchedules} />
      <CreateDialog setSchedules={setSchedules} />
    </div>
  )
}

export default () => {
  const session = useSessionValue()

  if (session === '') {
    return <Welcome />
  }

  return (
    <>
      <HeadTitle>{title}</HeadTitle>
      <AppLayout title={title} createLink="New schedule">
        <GetStartedBroadcast />
        <MainContainer>
          <SchedulesList />
        </MainContainer>
      </AppLayout>
    </>
  )
}
