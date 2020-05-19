import type { Repeat } from 'database/types'

export function getTime() {
  return new Date()
}

export const sortByHoursMinutesString = (a: string, b: string) => {
  const [aStartHours, aStartMinutes] = a.split(':')
  const [bStartHours, bStartMinutes] = b.split(':')

  if (
    aStartHours > bStartHours ||
    (aStartHours === bStartHours && aStartMinutes > bStartMinutes)
  ) {
    return 1
  }

  if (
    aStartHours < bStartHours ||
    (aStartHours === bStartHours && aStartMinutes < bStartMinutes)
  ) {
    return -1
  }

  return 0
}

export const getRepeatMessage = (repeat: Repeat) => {
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
    (monday &&
      tuesday &&
      wednesday &&
      thursday &&
      friday &&
      saturday &&
      sunday) ||
    (!monday &&
      !tuesday &&
      !wednesday &&
      !thursday &&
      !friday &&
      !saturday &&
      !sunday)
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
