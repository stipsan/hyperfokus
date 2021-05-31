import type { Tag } from "database/types"

export function sortByName(a: Tag, b: Tag): number {
  return  a.name.localeCompare(b.name)
}