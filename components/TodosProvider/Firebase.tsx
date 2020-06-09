import type { Todo } from 'database/types'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { atom, useRecoilState } from 'recoil'
import { Provider } from './Context'
import type { TodosContext } from './Context'

const todosState = atom<Todo[]>({
  key: 'firebaseTodos',
  default: [],
})

export default ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useRecoilState(todosState)

  const context = useMemo(
    (): TodosContext => ({
      todos,
    }),
    [todos]
  )

  return <Provider value={context}>{children}</Provider>
}
