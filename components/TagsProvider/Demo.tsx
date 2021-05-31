import { tags } from 'database/demo'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'
import create from 'zustand'
import type { TagsContext } from './Context'
import { Provider } from './Context'
import { sortByName } from './utils'

const useStore = create<TagsContext>((set) => ({
  tags,
  addTag: async (tag) => {
    set((state) => ({
      tags: [...state.tags, tag].sort(sortByName),
    }))
    return { id: tag.id }
  },
  editTag: async (tag, id) =>
    set((state) => {
      const index = state.tags.findIndex((tag) => tag.id === id)

      const newTags = replaceItemAtIndex(state.tags, index, {
        ...state.tags[index],
        name: tag.name,
        color: tag.color,
      })
      return { tags: newTags.sort(sortByName) }
    }),
  deleteTag: async (id) =>
    set((state) => {
      const index = state.tags.findIndex((tag) => tag.id === id)
      const newTags = removeItemAtIndex(state.tags, index)
      return { tags: newTags }
    }),
}))

const Demo = ({ children }: { children: ReactNode }) => {
  const tags = useStore((state) => state.tags)
  const addTag = useStore((state) => state.addTag)
  const editTag = useStore((state) => state.editTag)
  const deleteTag = useStore((state) => state.deleteTag)

  const context = useMemo(
    (): TagsContext => ({
      tags,
      addTag,
      editTag,
      deleteTag,
    }),
    [tags, addTag, editTag, deleteTag]
  )

  return <Provider value={context}>{children}</Provider>
}

export default Demo
