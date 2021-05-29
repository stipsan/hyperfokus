import { tags } from 'database/demo'
import type { Tag } from 'database/types'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Provider } from './Context'
import type { TagsContext } from './Context'

const tagsState = atom<Tag[]>({
  key: 'demoTags',
  default: tags,
})

const Demo = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useRecoilState(tagsState)

  const context = useMemo(
    (): TagsContext => ({
      tags,
      setTags,
    }),
    [tags]
  )

  return <Provider value={context}>{children}</Provider>
}

export default Demo
