import database from 'database/localstorage'
import type { Tag } from 'database/types'
import { useLogException } from 'hooks/analytics'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Provider } from './Context'
import type { TagsContext } from './Context'

const tagsState = atom<Tag[]>({
  key: 'localstorageTags',
  default: null,
})

const asyncTagsState = selector<Tag[]>({
  key: 'asyncLocalstorageTags',
  get: async ({ get }) => {
    const cache = get(tagsState)

    // It's only null when it should be fetched
    if (cache === null) {
      //await new Promise((resolve) => setTimeout(() => resolve(), 3000))
      return database.getTags()
    }

    return cache
  },
  set: async ({ set }, tags: Tag[]) => {
    set(tagsState, tags)
    await database.setTags(tags)
  },
})

const Localstorage = ({ children }: { children: ReactNode }) => {
  const logException = useLogException()
  const syncTags = useSetRecoilState(tagsState)
  const [tags, setTags] = useRecoilState(asyncTagsState)

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = database.observeTags(
      (tags) => syncTags(tags),
      (err) => logException(err)
    )

    return () => unsubscribe()
  }, [])

  const context = useMemo(
    (): TagsContext => ({
      tags,
      setTags,
    }),
    [tags]
  )

  return <Provider value={context}>{children}</Provider>
}

export default Localstorage
