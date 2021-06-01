import type { Tag } from 'database/types'

export type Tags = Tag[]
export type AddTag = (data: Tag) => Promise<{ id: string }>
export type EditTag = (data: Tag, id: string) => Promise<void>
export type DeleteTag = (id: string) => Promise<void>