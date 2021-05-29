import { useTags } from 'components/TagsProvider'
import { useMemo } from 'react'
import cx from 'classnames'

export default function TagsFilter() {
  const { tags } = useTags()

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

  return (
    <div
      className="px-inset py-2 bg-gray-100 flex flex-no-wrap overflow-x-auto"
      style={{ scrollSnapAlign: 'start', scrollSnapType: 'x proximity' }}
    >
      <span style={{ scrollSnapAlign: 'end' }}>Filter:</span>
      {list.map((tag, i) => (
        <button
          key={tag.name}
          className={cx('ml-2 ', { 'mr-2': i + 1 === list.length })}
          style={{ scrollSnapAlign: 'end' }}
          aria-pressed={false}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
