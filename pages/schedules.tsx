import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import type { Repeat, Schedule } from 'database/types'
import { useGetSchedules } from 'hooks/schedules'
import { useSessionValue } from 'hooks/session'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { sortByHoursMinutesString } from 'utils/time'

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

const SchedulesForm = ({ initialState }: { initialState: Schedule }) => {
  return <>Testing that it persists {initialState.id}</>
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
  const initialStateS = useMemo(
    () => schedules.find((schedule) => schedule.id === router.query.edit),
    [router.query.edit]
  )

  useEffect(() => {
    console.log('id changed', router.query.edit)
    if (router.query.edit) {
      const nextInitialState = schedules.find(
        (schedule) => schedule.id === router.query.edit
      )
      if (nextInitialState) {
        setInitialState(nextInitialState)
      }
    }
  }, [router.query.edit])

  useEffect(() => {
    console.log('memo changed', router.query.edit, initialState)
  }, [initialState])

  const close = () => {
    router.push(router.pathname)
  }

  return (
    <AnimatedDialog
      isOpen={!!router.query.edit && !!initialState}
      onDismiss={close}
      aria-label="Edit schedule"
    >
      <p className="py-16 text-center">
        The ability to edit schedules is coming {initialState?.id}!
        <SchedulesForm initialState={initialState} />
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

const getRepeatMessage = (repeat: Repeat) => {
  const {
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
  } = repeat
  if (
    monday &&
    tuesday &&
    wednesday &&
    thursday &&
    friday &&
    saturday &&
    sunday
  ) {
    return 'every day'
  }

  if (
    saturday &&
    sunday &&
    !monday &&
    !tuesday &&
    !wednesday &&
    !thursday &&
    !friday
  ) {
    return 'every weekend'
  }

  if (
    !saturday &&
    !sunday &&
    monday &&
    tuesday &&
    wednesday &&
    thursday &&
    friday
  ) {
    return 'every weekday'
  }

  const keys = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]
  if (keys.some((key) => repeat[key])) {
    const repeated = keys.filter((key) => repeat[key])
    return `every ${repeated.join(', ')}`
  }

  return ''
}

const SchedulesList = () => {
  const [schedules, setSchedules] = useState(useGetSchedules())
  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) =>
      sortByHoursMinutesString(a.start, b.start)
    )
  }, [schedules])

  return (
    <>
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
              <div className="text-3xl">{`${schedule.start} – ${schedule.end}`}</div>
              <div>{metaInformation.join(', ')}</div>
              {!schedule.enabled && <div>Disabled</div>}
            </a>
          </Link>
        )
      })}
      <EditDialog schedules={schedules} setSchedules={setSchedules} />
      <CreateDialog setSchedules={setSchedules} />
    </>
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
