import type {
  DatabaseType,
  Repeat,
  ScheduleDelta,
  Tag,
  Todo,
  TodoDelta,
} from './types'

// Ensure this module is never run in an SSR env by mistake
if (typeof window === 'undefined') {
  throw new TypeError(`This module can't run on the server!`)
}

export let tags = [
  { name: 'Bug', color: '#DC2626' },
  { name: 'Feature', color: '#2b6cb0' },
].map(
  (tag, i): Tag => ({
    id: `tag-${i}`,
    ...tag,
  })
)

const repeatNone: Repeat = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
}
const repeatWeekdays: Repeat = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
}
const repeatWeekends: Repeat = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: true,
  sunday: true,
}
const repeatAll: Repeat = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
}
export let schedules = [
  { start: '07:20', duration: 60, end: '08:20', repeat: repeatWeekdays },
  { start: '11:00', duration: 120, end: '13:00', repeat: repeatWeekends },
  {
    start: '16:00',
    duration: 150,
    end: '18:30',
    repeat: { ...repeatNone, monday: true },
  },
  { start: '18:00', duration: 60, end: '19:00', repeat: repeatAll },
  /*
  {
    start: '18:00',
    duration: 30,
    end: '18:30',
    repeat: { ...repeatNone, tuesday: true },
  },
  {
    start: '19:00',
    duration: 30,
    end: '19:30',
    repeat: { ...repeatNone, wednesday: true },
  },
  {
    start: '20:00',
    duration: 30,
    end: '20:30',
    repeat: { ...repeatNone, thursday: true },
  },
  {
    start: '21:00',
    duration: 30,
    end: '21:30',
    repeat: { ...repeatNone, friday: true },
  },
  {
    start: '22:00',
    duration: 30,
    end: '22:30',
    repeat: { ...repeatNone, saturday: true },
  },
  {
    start: '23:00',
    duration: 30,
    end: '23:30',
    repeat: { ...repeatNone, sunday: true },
  },
  // */
].map((schedule: ScheduleDelta, i) => ({
  id: `schedule-${i}`,
  after: new Date(),
  duration: 0,
  start: '00:00',
  end: '00:00',
  enabled: true,
  repeat: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
  ...schedule,
}))

export let todos = [
  {
    description: 'Ability to create todos.',
    duration: 30,
    completed: new Date(),
    tags: [tags[0].id],
  },
  {
    description: 'Ability to edit todos.',
    duration: 30,
    completed: new Date(),
    tags: [tags[0].id],
  },
  {
    description: 'Ability to delete todos.',
    duration: 30,
    completed: new Date(),
    tags: [tags[0].id],
  },
  { description: 'Settings screen.', duration: 60, tags: [tags[0].id] },
  {
    description: 'Notify the user of todos that lack duration.',
    duration: 60,
    tags: [tags[0].id, tags[1].id],
  },
  {
    description: 'Notify of todos that are missing from the forecast.',
    duration: 60,
    tags: [tags[1].id],
  },

  {
    description:
      'Implement daily reset for when todos are moved into the "Completed Todos" log and out of the planner.',
    duration: 30,
    tags: [tags[1].id],
  },
  {
    description: 'About page with link to GitHub and other info.',
    duration: 30,
  },
  {
    description: 'Ability view completed todos.',
    duration: 30,
    tags: [tags[0].id],
  },
  {
    description: 'Ability to toggle completed status on todos.',
    duration: 30,
    tags: [tags[0].id],
  },
  {
    description:
      'Help page should explain how todos and schedules are interconnected',
    duration: 30,
  },
  {
    description:
      '"More" page should have a sidebar over links to its subpages.',
    duration: 30,
  },
  {
    description:
      'On mobile the "More" page should have a topbar over links to its subpages.',
    duration: 30,
    tags: [tags[0].id],
  },
  {
    description:
      'Handle crazy long list of activities, list them under "Some day" or whatever',
    duration: 30,
  },
  { description: 'Norwegian locale and translations.', duration: 120 },
  { description: 'Add help page skeleton', duration: 15, done: true },
].map((activity: TodoDelta, i): Todo => {
  const { created = new Date(), done = false } = activity
  const { modified = created, completed = done ? new Date() : undefined } =
    activity

  return {
    id: `activity-${i}`,
    order: i,
    created,
    modified,
    done,
    completed,
    ...activity,
  }
})

const database: DatabaseType = {
  getTags() {
    return Promise.resolve(tags)
  },
  setTags(nextTags) {
    tags = JSON.parse(JSON.stringify(nextTags))

    return Promise.resolve()
  },
  observeTags() {
    return () => {}
  },
  getSchedules() {
    return Promise.resolve(schedules)
  },
  setSchedules(nextSchedules) {
    schedules = JSON.parse(JSON.stringify(nextSchedules))

    return Promise.resolve()
  },
  observeSchedules() {
    return () => {}
  },
  observeTodos() {
    return () => {}
  },
  getTodos() {
    return Promise.resolve(todos)
  },
  setTodos(nextTodos) {
    todos = JSON.parse(JSON.stringify(nextTodos))

    return Promise.resolve()
  },
}

export default database
