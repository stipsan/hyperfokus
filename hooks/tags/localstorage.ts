import { useLogException } from 'hooks/analytics'
import { createAsset } from 'use-asset'
import database from 'database/localstorage'
import { nanoid } from 'nanoid'
import create from 'zustand'
import type {
  Tags,
  AddTag,
  EditTag,
  DeleteTag,
} from './types'
import { addTag, deleteTag, editTag } from './utils'
import { useEffect } from 'react'

type StoreState = {
  tags: Tags
  setTags: (tags: Tags) => void
  addTag: AddTag
  editTag: EditTag
  deleteTag: DeleteTag
}

import * as r from 'react'
import * as rd from 'react-dom'
import * as s from 'scheduler'
console.log({r,rd,s})

const useStore = create<StoreState>((set,get) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
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

const asset = createAsset(async (setTags: (tags: Tags) => void) => {
  //await new Promise((resolve) => setTimeout(() => resolve(void 0), 3000))

  const tags = await database.getTags()

  setTags(tags)
})


const selectSetTags = (state: StoreState) => state.setTags
const selectTags = (state: StoreState) => state.tags
export const useTags = () => {
  const logException = useLogException()
  const setTags = useStore(selectSetTags)
  // Only runs once, and ensures the view is suspended until the initial tags are fetched
  asset.read(setTags)
  const tags = useStore(selectTags)

  // Sync the state in case it's been updated in other tabs
  useEffect(() => {
    const unsubscribe = database.observeTags(
      (tags) => setTags(tags),
      (err) => logException(err)
    )

    return () => unsubscribe()
  }, [setTags, logException])

  return tags
}

const selectAddTag=(state: StoreState) => state.addTag
export const useAddTag = () => useStore(selectAddTag)

const selectEditTag =(state: StoreState) => state.editTag
export const useEditTag = () => useStore(selectEditTag)

const selectDeleteTag = (state: StoreState) => state.deleteTag
export const useDeleteTag = () => useStore(selectDeleteTag)
