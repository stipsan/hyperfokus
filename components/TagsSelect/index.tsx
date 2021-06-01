import CreatableSelect from 'react-select/creatable'
import type { Tags, AddTag } from 'hooks/tags/types'
import { useEffect, useState } from 'react'
import { useMemo } from 'react'

type Props = {
  tags: Tags
  addTag: AddTag
  selected: string[]
  setSelected: (selected: string[]) => void
}

export default function TagsSelect({
  tags,
  addTag,
  selected: initialSelected,
  setSelected,
}: Props) {
  const selected = useMemo<Set<string>>(
    () => new Set(initialSelected),
    [initialSelected]
  )
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    () => tags.map((tag) => ({ label: tag.name, value: tag.id }))
  )

  useEffect(() => console.count('initialSelected'), [initialSelected])
  useEffect(() => console.count('selected'), [selected])

  console.log({ tags, addTag, setSelected })

  const [isLoading, setLoading] = useState(false)

  return (
    <CreatableSelect
      isClearable
      isDisabled={isLoading}
      isLoading={isLoading}
      onChange={(...args) => console.log('onChange', ...args)}
      onCreateOption={(...args) => console.log('onCreateOption', ...args)}
      options={options}
      value={selected}
    />
  )
}
