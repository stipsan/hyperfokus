/* eslint-disable no-restricted-globals */
import { getForecast } from './forecast'
/*
type args = Parameters<typeof getForecast>
addEventListener('message', (event) => {
  console.log(event)
  const {schedules,todos, lastReset, deadlineMs}: {schedules: args[0], todos: args[1],lastReset: args[2],deadlineMs: args[3]} = event.data
  postMessage('getForecast',JSON.stringify(getForecast(schedules, todos, lastReset, deadlineMs)))
})
// */

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
  //console.log(event.data, getForecast(schedules, todos, lastReset, deadlineMs))
  console.log('bye world')
  getForecast(schedules, todos, lastReset, deadlineMs)
  postMessage('ok')
})
