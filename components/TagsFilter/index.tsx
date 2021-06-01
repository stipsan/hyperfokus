import cx from 'classnames'
import type { Tags } from 'hooks/tags/types'

import { useMemo, memo } from 'react'

type Props = {
  tags: Tags
  selected: Set<string | boolean>
  setSelected: (selected: Set<string | boolean>) => void
}
function TagsFilter({ tags, selected, setSelected }: Props) {
  const list = useMemo(
    () => [
      { name: 'Everything', id: false },
      { name: 'Untagged', id: true },
      ...tags,
    ],
    [tags]
  )

  if (!tags.length) {
    return null
  }

  // TODO show filtering as "Everything" if every tag is selected

  return (
    <div
      className="px-inset py-2 bg-gray-100 flex flex-no-wrap overflow-x-auto items-center"
      style={{ scrollSnapAlign: 'start', scrollSnapType: 'x proximity' }}
    >
      <span style={{ scrollSnapAlign: 'end' }}>Filter:</span>
      {list.map((tag, i) => {
        const active =
          tag.id === false ? selected.size === 0 : selected.has(tag.id)
        return (
          <button
            key={tag.name}
            className={cx(
              'ml-2 px-3 py-1 font-semibold focus:outline-none rounded-full whitespace-pre-wrap',
              active
                ? 'text-gray-100 hover:text-white bg-gray-600 hover:bg-gray-500'
                : 'text-gray-800 hover:text-gray-900 bg-gray-100 hover:bg-gray-200',
              { 'mr-2': i + 1 === list.length }
            )}
            style={{ scrollSnapAlign: 'end' }}
            aria-pressed={active}
            onClick={() => {
              if (tag.id === false) {
                setSelected(new Set())
              } else {
                const nextSelected = new Set([...selected])
                if (nextSelected.has(tag.id)) {
                  nextSelected.delete(tag.id)
                } else {
                  nextSelected.add(tag.id)
                }
                setSelected(nextSelected)
              }
            }}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}

export default memo(TagsFilter)
