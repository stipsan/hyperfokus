# hyperfokus

### TODO

- tags
- composite todo
- soft delete
- drag & drop reordering
- [Checklists](https://culturedcode.com/things/whats-new/)
- filter, parse, santize with [zod](https://www.npmjs.com/package/zod)

#### tags

Everything | Untagged | Netflix | Reading list
Checkbox styling, selecting Everything unchecks the others. Have a link at the end with a cogwheel or something that takes you to the config screen.

##### refactor out of context provider and hooks hell

refactor out of using context to hot swap app logic, refactor to good old props, and hot swap children components to implement app logic that differ between adapters.

For example with /schedules
Right now it setup as `AppLayout => SchedulesProvider => Schedules` with zero props, all com is by `useContext` wiring.

New approach:

- `AppLayout => SchedulesScreenLazy(/screens/SchedulesScreen/Lazy.tsx) => SchedulesScreen{Demo,Firebase,Localstorage}(/screens/SchedulesScreen/{Demo,Firebase,Localstorage}.tsx) => SchedulesScreen(/screens/SchedulesScreen/index.tsx)`
- Props instead of context, with the props source being clearly defined.
- The only dynamic part is which of the 3 screen wrappers to load, the rest is much more static and easier to optimize.
