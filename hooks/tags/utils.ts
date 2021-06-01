import type { Tag } from 'database/types'
import { removeItemAtIndex, replaceItemAtIndex } from 'utils/array'

export function addTag(tags: Tag[], data: Tag): Tag[] {
  return [...tags, data].sort(sortByName)
}

export function editTag(tags: Tag[], data: Tag, id: string): Tag[] {
  const index = tags.findIndex((tag) => tag.id === id)

  const newTags = replaceItemAtIndex(tags, index, {
    ...tags[index],
    name: data.name,
    color: data.color,
  })
  return newTags.sort(sortByName)
}

export function deleteTag(tags: Tag[], id: string): Tag[] {
  const index = tags.findIndex((tag) => tag.id === id)
  const newTags = removeItemAtIndex(tags, index)
  return newTags
}

function sortByName(a: Tag, b: Tag): number {
  return a.name.localeCompare(b.name)
}
