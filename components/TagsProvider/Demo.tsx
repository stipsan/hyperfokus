import { tags } from 'database/demo'
import { nanoid } from 'nanoid'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import create from 'zustand'
import type { TagsContext } from './Context'
import { Provider } from './Context'
import { addTag, deleteTag, editTag } from './utils'

const useStore = create<TagsContext>((set) => ({
  tags,
  addTag: async (tag) => {
    const id = nanoid()
    set(({ tags }) => ({
      tags: addTag(tags, tag, id),
    }))
    return { id }
  },
  editTag: async (tag, id) => {
    set(({ tags }) => ({
      tags: editTag(tags, tag, id),
    }))
  },
  deleteTag: async (id) => {
    set(({ tags }) => ({
      tags: deleteTag(tags, id),
    }))
  },
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
