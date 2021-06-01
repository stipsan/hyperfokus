import type { Schedule } from "database/types"
import { sortByHoursMinutesString } from "utils/time"

export function sortByTime(a: Schedule, b: Schedule) {
  let result = sortByHoursMinutesString(a.start, b.start)
  return result !== 0 ? result : sortByHoursMinutesString(a.end, b.end)
}