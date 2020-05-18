import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import type { Schedule } from 'database/types'
import { useGetSchedules } from 'hooks/schedules'
import { useSessionValue } from 'hooks/session'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useReducer, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { getRepeatMessage, sortByHoursMinutesString } from 'utils/time'

const title = 'Schedules'

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
      <p className="py-16 text-center">
        The ability to create schedules is coming soon!
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
  | { type: 'change'; payload: { name: string; value: string } }
  | { type: 'blur:start' }
  | { type: 'blur:duration' }
  | { type: 'blur:end' }
  | { type: 'change:enabled'; payload: { value: string } }
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

const SchedulesForm = ({
  initialState,
  onDismiss,
  editing,
  onDelete,
}: {
  initialState: Schedule
  editing?: boolean
  onDismiss: () => void
  onSubmit: (state: any) => void
  onDelete?: (state: any) => void
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <>
      <form>Test!</form>
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
            <Button variant="primary" onClick={onDismiss}>
              Save
            </Button>
          </>
        }
      />
    </>
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
      <p className="py-16 text-center">
        The ability to edit schedules is coming {initialState?.id}!
      </p>
      <SchedulesForm
        initialState={initialState}
        onDismiss={close}
        onSubmit={() => void 0}
        onDelete={() => {
          if (
            confirm(
              `Are you sure you want to delete "${initialState.start} – ${
                initialState.end
              }, ${getRepeatMessage(initialState.repeat)}"?`
            )
          ) {
            close()
          }
        }}
      />
    </AnimatedDialog>
  )
}

const SchedulesList = () => {
  const [schedules, setSchedules] = useState(useGetSchedules())
  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) =>
      sortByHoursMinutesString(a.start, b.start)
    )
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
