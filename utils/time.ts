export const sortByHoursMinutesString = (a: string, b: string) => {
  console.group('sortByHoursMinutesString')
  console.count('sortByHoursMinutesString')
  console.log(a, b)
  console.groupEnd()

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
