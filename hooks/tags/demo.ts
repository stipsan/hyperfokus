import { tags } from 'database/demo'
import { nanoid } from 'nanoid'
import create from 'zustand'
import type {
  Tags,
  AddTag,
  EditTag,
  DeleteTag,
} from './types'
import { addTag, deleteTag, editTag } from './utils'

type StoreState = {
  tags: Tags
  addTag: AddTag
  editTag: EditTag
  deleteTag: DeleteTag
}

const useStore = create<StoreState>((set) => ({
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

const selectTags = (state: StoreState) => state.tags
export const useTags = () => useStore(selectTags)

const selectAddTag=(state: StoreState) => state.addTag
export const useAddTag = () => useStore(selectAddTag)

const selectEditTag =(state: StoreState) => state.editTag
export const useEditTag = () => useStore(selectEditTag)

const selectDeleteTag = (state: StoreState) => state.deleteTag
export const useDeleteTag = () => useStore(selectDeleteTag)
