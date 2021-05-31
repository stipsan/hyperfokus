import type { Tag } from 'database/types'
import { createContext, useContext } from 'react'

export type TagsContext = {
  tags: Tag[]
  addTag(data: Tag): Promise<{ id: string }>
  editTag(data: Tag, id: string): Promise<void>
  deleteTag(id: string): Promise<void>
}

const error = new ReferenceError(
  `TagsProvider isn't in the tree, the context for useTags is missing`
)
const context = createContext<TagsContext>({
  get tags() {
    throw error
    return []
  },
  get addTag() {
    throw error
    return async () => ({ id: '' })
  },
  get editTag() {
    throw error
    return async () => {}
  },
  get deleteTag() {
    throw error
    return async () => {}
  },
})

export const { Provider } = context

// TODO rewrite to separate contexts for actions and state (one for each, as actions only change once)
export const useTags = () => {
  const { tags, addTag, editTag, deleteTag } = useContext(context)

  return { tags, addTag, editTag, deleteTag }

  /*
  const setSortedTags: Dispatch<SetStateAction<Tag[]>> = (value) => {
    setTags((state) => {
      const tags = typeof value === 'function' ? value(state) : value
      // Do the sorting on write instead of on read
      tags.sort((a, b) => a.name.localeCompare(b.name))
      // @TODO should filter and sanitize data to ensure no properties are missing
      return tags
    })
  }
  */

  return { tags, setTags: setSortedTags }
}
