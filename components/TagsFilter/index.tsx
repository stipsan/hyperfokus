import { useTags } from 'components/TagsProvider'
import { useMemo } from 'react'
import cx from 'classnames'

type Props = {
  selected: Set<string | boolean>
  setSelected: (selected: Set<string | boolean>) => void
}
export default function TagsFilter({ selected, setSelected }: Props) {
  const { tags } = useTags()

  const list = useMemo(
    () => [
      { name: 'Everything', id: false },
      { name: 'Untagged', id: true },
      ...tags,
    ],
    [tags]
  )

  console.log({ selected, tags, list, setSelected })

  if (!tags.length) {
    return null
  }

  return (
    <div
      className="px-inset py-2 bg-gray-100 flex flex-no-wrap overflow-x-auto items-center"
      style={{ scrollSnapAlign: 'start', scrollSnapType: 'x proximity' }}
    >
      <span style={{ scrollSnapAlign: 'end' }}>Filter:</span>
      {list.map((tag, i) => (
        <button
          key={tag.name}
          className={cx(
            'ml-2 px-3 py-1 font-semibold focus:outline-none rounded-full',
            tag.id === false
              ? selected.size === 0
              : selected.has(tag.id)
              ? 'text-gray-100 hover:text-white bg-gray-600 hover:bg-gray-500'
              : 'text-gray-800 hover:text-gray-900 bg-gray-100 hover:bg-gray-200',
            { 'mr-2': i + 1 === list.length }
          )}
          style={{ scrollSnapAlign: 'end' }}
          aria-pressed={
            tag.id === false ? selected.size === 0 : selected.has(tag.id)
          }
          onClick={() => {
            const nextSelected = new Set([...selected])
            if (nextSelected.has(tag.id)) {
              nextSelected.delete(tag.id)
            } else {
              nextSelected.add(tag.id)
            }
            setSelected(nextSelected)
          }}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
