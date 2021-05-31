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

export const useTags = () => {
  const { tags, addTag, editTag, deleteTag } = useContext(context)

  return { tags, addTag, editTag, deleteTag }
}
