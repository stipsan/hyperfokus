import { Dialog } from '@reach/dialog'
import cx from 'classnames'
import Button from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
import HeadTitle from 'components/HeadTitle'
import { AppLayout, MainContainer } from 'components/layouts'
import Welcome from 'components/screens/Welcome'
import type { Repeat, Schedule } from 'database/types'
import { useDatabase } from 'hooks/database'
import { useSessionValue } from 'hooks/session'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const title = 'Schedules'

const CreateDialog = () => {
  const router = useRouter()
  const close = () => {
    router.push(router.pathname)
  }

  if (!router.query.create) {
    return null
  }

  return (
    <Dialog onDismiss={close} aria-label="Create new schedule">
      <p className="py-16">The ability to create schedules is coming soon!</p>
      <DialogToolbar
        right={
          <Button variant="primary" onClick={close}>
            Okay
          </Button>
        }
      />
    </Dialog>
  )
}
const EditDialog = () => {
  const router = useRouter()
  const close = () => {
    router.push(router.pathname)
  }

  if (!router.query.edit) {
    return null
  }

  return (
    <Dialog onDismiss={close} aria-label="Edit schedule">
      <p className="py-16">The ability to edit schedules is coming soon!</p>
      <DialogToolbar
        right={
          <Button variant="primary" onClick={close}>
            Okay
          </Button>
        }
      />
    </Dialog>
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

let promise = null
let schedules: false | Schedule[] = false

const SchedulesList = () => {
  const database = useDatabase()

  useEffect(
    () => () => {
      // Reset cache on unmount
      promise = null
      schedules = false
    },
    []
  )

  if (schedules === false) {
    if (promise === null) {
      promise = database
        .getSchedules()
        /*
        .then(
          (result) =>
            new Promise((resolve) => setTimeout(() => resolve(result), 3000))
        )
        // */
        .then(
          (result) => {
            schedules = result
          },
          (err) => console.error(err)
        )
    }
    throw promise
  }

  return (
    <>
      {schedules.map((schedule, i) => {
        const metaInformation = [`${schedule.duration} minutes`]
        const repeatMessage = getRepeatMessage(schedule.repeat)
        if (repeatMessage) metaInformation.push(repeatMessage)

        return (
          <Link key={schedule.id} href={`?edit=${schedule.id}`} shallow>
            <a
              className={cx(
                'block px-8 py-6 hover:bg-gray-200 focus:bg-gray-100 active:bg-gray-200 focus:outline-none',
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
      <CreateDialog />
      <EditDialog />
    </>
  )
}
