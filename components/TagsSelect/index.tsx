import CreatableSelect from 'react-select/creatable'
import type { Tags, AddTag } from 'hooks/tags/types'
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
  selected,
  setSelected,
}: Props) {
  /*
  const selected = useMemo<Set<string>>(
    () => new Set(initialSelected),
    [initialSelected]
  )
  useEffect(() => console.count('initialSelected'), [initialSelected])
  // */
  const options = useMemo<{ label: string; value: string }[]>(
    () => tags.map((tag) => ({ label: tag.name, value: tag.id })),
    [tags]
  )

  //  const [isLoading, setLoading] = useState(false)

  return (
    <CreatableSelect
      isMulti
      isClearable
      //isDisabled={isLoading}
      //isLoading={isLoading}
      onChange={(options) => setSelected(options.map((option) => option.value))}
      //onCreateOption={(name) => addTag({ name, color: '' })}
      options={options}
      value={options.filter((option) => selected.includes(option.value))}
    />
  )
}
