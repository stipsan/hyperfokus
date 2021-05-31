import database from 'database/localstorage'
import type { Tag } from 'database/types'
import { useLogException } from 'hooks/analytics'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Provider } from './Context'
import type { TagsContext } from './Context'
import create from 'zustand'
import { addTag, deleteTag, editTag } from './utils'
import { nanoid } from 'nanoid'
import { createAsset } from 'use-asset'

type TagsStore = TagsContext & {
  setTags: (tags: Tag[]) => void
}

const useStore = create<TagsStore>((set, get) => ({
  tags: [],
  setTags: (tags: Tag[]) => set({ tags }),
  addTag: async (tag) => {
    const id = nanoid()
    const { tags } = get()
    const updatedTags = addTag(tags, tag, id)
    await database.setTags(updatedTags)
    set({ tags: updatedTags })
    return { id }
  },
  editTag: async (tag, id) => {
    const { tags } = get()
    const updatedTags = editTag(tags, tag, id)
    await database.setTags(updatedTags)
    set({ tags: updatedTags })
  },
  deleteTag: async (id) => {
    const { tags } = get()
    const updatedTags = deleteTag(tags, id)
    await database.setTags(updatedTags)
    set({ tags: updatedTags })
  },
}))

const asset = createAsset(async (setTags: TagsStore['setTags']) => {
  //await new Promise((resolve) => setTimeout(() => resolve(void 0), 3000))

  const tags = await database.getTags()

  setTags(tags)
})

const Localstorage = ({ children }: { children: ReactNode }) => {
  const logException = useLogException()
  const setTags = useStore((state) => state.setTags)
  // Only runs once, and ensures the view is suspended until the initial tags is fetched
  asset.read(setTags)
  const tags = useStore((state) => state.tags)
  const addTag = useStore((state) => state.addTag)
  const editTag = useStore((state) => state.editTag)
  const deleteTag = useStore((state) => state.deleteTag)

  // Sync the state in case it's been updated
  useEffect(() => {
    const unsubscribe = database.observeTags(
      (tags) => setTags(tags),
      (err) => logException(err)
    )

    return () => unsubscribe()
  }, [])

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

export default Localstorage
