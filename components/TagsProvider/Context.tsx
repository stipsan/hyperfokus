import type { Tag } from 'database/types'
import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export type TagsContext = {
  tags: Tag[]
  setTags: Dispatch<SetStateAction<Tag[]>>
}

const error = new ReferenceError(
  `TagsProvider isn't in the tree, the context for useTags is missing`
)
const context = createContext<TagsContext>({
  get tags() {
    throw error
    return []
  },
  get setTags() {
    throw error
    return () => {}
  },
})

export const { Provider } = context

export const useTags = () => {
  const { tags, setTags } = useContext(context)

  const setSortedTags: Dispatch<SetStateAction<Tag[]>> = (value) => {
    setTags((state) => {
      const tags = typeof value === 'function' ? value(state) : value
      // Do the sorting on write instead of on read
      tags.sort((a, b) => a.name.localeCompare(b.name))
      // @TODO should filter and sanitize data to ensure no properties are missing
      return tags
    })
  }

  return { tags, setTags: setSortedTags }
}
