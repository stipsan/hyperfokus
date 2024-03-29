/* eslint-disable no-restricted-globals */
import cx from 'classnames'
import AnimatedDialog from 'components/AnimatedDialog'
import Button, { className } from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import type { Schedule } from 'database/types'
import { useAnalytics } from 'hooks/analytics'
import type {
  AddSchedule,
  DeleteSchedule,
  EditSchedule,
  Schedules,
} from 'hooks/schedules/types'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { FC } from 'react'
import { useEffect, useReducer, useState } from 'react'
import { getRepeatMessage } from 'utils/time'
import styles from './index.module.css'

const TrackCreateDialog = () => {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'New Schedule',
    })
  }, [analytics])

  return null
}

const CreateDialog = ({ addSchedule }: { addSchedule: AddSchedule }) => {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'New Schedule',
    })
  }, [analytics])

  const router = useRouter()
  const close = () => {
    router.push(router.pathname, undefined, { shallow: true })
  }

  return (
    <AnimatedDialog
      isOpen={!!router.query.create}
      onDismiss={close}
      aria-label="Create new schedule"
    >
      <ScheduleForm
        onDismiss={close}
        onSubmit={async (state) => {
          await addSchedule(state)
          close()
          analytics.logEvent('schedule_create', {
            start: state.start,
            end: state.end,
            duration: state.duration,
            repeat: state.repeat,
          })
        }}
      />
      <TrackCreateDialog />
    </AnimatedDialog>
  )
}

const getMinutesFromTime = (time: string) => {
  const [hours, minutes] = time.split(':')

  return parseInt(hours, 10) * 60 + parseInt(minutes, 10)
}

const getDuration = (state: TimeState) => {
  if (!state.start.match(/:/) || !state.end.match(/:/)) {
    return state.duration
  }

  const startMinutes = getMinutesFromTime(state.start)
  const endMinutes = getMinutesFromTime(state.end)

  return startMinutes < endMinutes
    ? endMinutes - startMinutes
    : startMinutes - endMinutes
}

const getEnd = (state: TimeState) => {
  if (!state.start.match(/:/) || !state.duration) {
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
    className="tnum form-input mt-1 block w-32"
    type="time"
    autoComplete="off"
    id="start"
    pattern="(0?[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])"
    placeholder="09:00"
    name="start"
    style={{ /*width: '12ch',*/ height: '42px' }}
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
    className="tnum form-input block mt-1 w-32"
    pattern="(0?[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])"
    placeholder="10:00"
    style={{ height: '42px' }}
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
        className="inline-flex items-center rounded capitalize"
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
        <span className="ml-2">{weekday}</span>
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
      <div className={styles.topGrid}>
        <Field className={styles.start} label="Start" htmlFor="start">
          <StartTime dispatch={dispatch} state={state} />
        </Field>
        <Field className={styles.end} label="End" htmlFor="end">
          <EndTime dispatch={dispatch} state={state} />
        </Field>
        <Field className={styles.duration} label="Duration" htmlFor="duration">
          <Duration dispatch={dispatch} state={state} />
        </Field>
      </div>

      <div className="block mt-4">
        <span className="block text-gray-700">Repeat</span>
        <div className={cx(styles.repeatGrid, 'mt-1')}>
          <Repeat dispatch={dispatch} state={state} />
        </div>
      </div>

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
            <label className="inline-grid grid-flow-col gap-2 items-center">
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
            <Button variant="primary" type="submit">
              Save
            </Button>
          </>
        }
      />
    </form>
  )
}

const TrackEditDialog = () => {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'Edit Schedule',
    })
  }, [analytics])

  return null
}
const EditDialog = ({
  schedules,
  editSchedule,
  deleteSchedule,
}: {
  schedules: Schedules
  editSchedule: EditSchedule
  deleteSchedule: DeleteSchedule
}) => {
  const analytics = useAnalytics()
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

      // Handle focus on blur
      const scheduleId = router.query.edit
      return () => {
        setTimeout(() => {
          const focusNode = document.querySelector(
            `a[data-focus="${scheduleId}"]`
          ) as HTMLElement
          focusNode?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          focusNode?.focus()
        }, 300)
      }
    }
  }, [router.query.edit, schedules])

  const close = () => {
    router.push(router.pathname, undefined, { shallow: true })
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
        onSubmit={async (state) => {
          await editSchedule(state, initialState.id)
          /*
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
          // */
          setInitialState(state)
          close()
          analytics.logEvent('schedule_edit', {
            start: state.start,
            end: state.end,
            duration: state.duration,
            repeat: state.repeat,
            enabled: state.enabled,
          })
        }}
        onDelete={async () => {
          if (
            confirm(
              `Are you sure you want to delete "${initialState.start} – ${
                initialState.end
              }, ${getRepeatMessage(initialState.repeat)}"?`
            )
          ) {
            await deleteSchedule(initialState.id)
            /*
            setSchedules((schedules) => {
              const index = schedules.findIndex(
                (schedule) => schedule.id === initialState.id
              )
              const newSchedules = removeItemAtIndex(schedules, index)
              return newSchedules
            })
            // */
            close()
            analytics.logEvent('schedule_delete', {
              start: initialState.start,
              end: initialState.end,
              duration: initialState.duration,
              repeat: initialState.repeat,
              enabled: initialState.enabled,
            })
          }
        }}
      />
      <TrackEditDialog />
    </AnimatedDialog>
  )
}

const NoSchedulesPlaceholder = () => {
  return (
    <div className="px-5 py-24 mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl font-medium title-font text-gray-900">
        No schedules
      </h1>

      <Link href="?create=true" shallow>
        <a
          className={cx(
            className({ variant: 'primary' }),
            'mt-10',
            styles.noscheduleslink
          )}
        >
          New schedule
        </a>
      </Link>
      <div
        className={cx(
          styles.noscheduleslinkBackdrop,
          'fixed left-0 top-0 right-0 bottom-0 z-30 pointer-events-none'
        )}
      />
    </div>
  )
}

function SchedulesFooter({ total }: { total: number }) {
  return (
    <p className="px-5 py-8 mx-auto flex flex-col items-center justify-center text-sm text-gray-500">
      {total} schedules
    </p>
  )
}

export default function SchedulesScreen({
  schedules,
  addSchedule,
  editSchedule,
  deleteSchedule,
}: {
  schedules: Schedules
  addSchedule: AddSchedule
  editSchedule: EditSchedule
  deleteSchedule: DeleteSchedule
}) {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'Schedules',
    })
  }, [analytics])

  return (
    <>
      <div className={cx({ 'border-b-2': schedules.length > 0 })}>
        {schedules.length < 1 && <NoSchedulesPlaceholder />}
        {schedules.map((schedule) => {
          const metaInformation = [`${schedule.duration} minutes`]
          const repeatMessage = getRepeatMessage(schedule.repeat)
          if (repeatMessage) metaInformation.push(repeatMessage)

          return (
            <Link shallow key={schedule.id} href={`?edit=${schedule.id}`}>
              <a
                data-focus={schedule.id}
                className={cx(
                  styles.schedule,
                  'block px-inset py-6 hover:bg-gray-200 focus:bg-gray-100 active:bg-gray-200 focus:outline-none border-t-2'
                )}
              >
                <div
                  className={cx('text-3xl tnum', {
                    'text-gray-600': !schedule.enabled,
                  })}
                >{`${schedule.start} – ${schedule.end}`}</div>
                <div className={cx({ 'text-gray-600': !schedule.enabled })}>
                  {metaInformation.join(', ')}
                </div>
                {!schedule.enabled && (
                  <div className="font-bold text-gray-600">Disabled</div>
                )}
              </a>
            </Link>
          )
        })}
        <EditDialog
          schedules={schedules}
          editSchedule={editSchedule}
          deleteSchedule={deleteSchedule}
        />
        <CreateDialog addSchedule={addSchedule} />
      </div>
      {schedules.length > 1 && <SchedulesFooter total={schedules.length} />}
    </>
  )
}
