import cx from 'classnames'
import AnimatedDialog from 'components/AnimatedDialog'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import type { Repeat } from 'database/types'
import { useGetSchedules } from 'hooks/schedules'
import { useSessionValue } from 'hooks/session'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

const title = 'Schedules'

const CreateDialog = () => {
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
      <input />
      <p className="py-16">The ability to create schedules is coming soon!</p>
      <p className="py-16">The ability to create schedules is coming soon!</p>
      <p className="py-16">The ability to create schedules is coming soon!</p>
      <p className="py-16">The ability to create schedules is coming soon!</p>
      <p className="py-16">The ability to create schedules is coming soon!</p>
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
const EditDialog = () => {
  const router = useRouter()
  const close = () => {
    router.push(router.pathname)
  }

  return (
    <AnimatedDialog
      isOpen={!!router.query.edit}
      onDismiss={close}
      aria-label="Edit schedule"
    >
      <p className="py-16 text-center">
        The ability to edit schedules is coming soon!
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

  return (
    <>
      {schedules.map((schedule, i) => {
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
            <a
              className={cx(
                'block px-inset py-6 hover:bg-gray-200 focus:bg-gray-100 active:bg-gray-200 focus:outline-none',
                {
                  'border-t-2': i !== 0,
                }
              )}
            >
              <div className="text-3xl">{`${schedule.start} – ${schedule.end}`}</div>
              <div>{metaInformation.join(', ')}</div>
              {!schedule.enabled && <div>Disabled</div>}
            </a>
          </Link>
        )
      })}
      <EditDialog />
      <CreateDialog />
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
