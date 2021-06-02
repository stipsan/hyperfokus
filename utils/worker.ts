/* eslint-disable no-restricted-globals */
import { getForecast } from './forecast'

//type args = Parameters<typeof getForecast>
addEventListener('message', (event) => {
  console.log('Hello world!')
  console.log(event)
  const { schedules, todos, lastReset, deadlineMs } = event.data
  /*
  const {
    schedules,
    todos,
    lastReset,
    deadlineMs,
  }: {
    schedules: args[0]
    todos: args[1]
    lastReset: args[2]
    deadlineMs: args[3]
  } = event.data
*/
// @ts-expect-error
  postMessage(getForecast(schedules, todos, lastReset, deadlineMs))
})
