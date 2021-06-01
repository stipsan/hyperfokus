import cx from 'classnames'
import type { Tags } from 'hooks/tags/types'
import chroma from 'chroma-js'
import { useMemo, memo } from 'react'

const defaultBg = '#f7fafc'

type Props = {
  tags: Tags
  selected: Set<string | number>
  setSelected: (selected: Set<string | number>) => void
}
function TagsFilter({ tags, selected, setSelected }: Props) {
  const list = useMemo(
    () =>
      [
        { name: 'Everything', id: '', color: defaultBg },
        { name: 'Untagged', id: 'untagged', color: defaultBg },
        ...tags,
      ].map((item) => {
        let color
        try {
          color = chroma(item.color)
        } catch {
          color = chroma(defaultBg)
        }
        return {
          ...item,
          bg: `rgba(${color.get('rgb.r')}, ${color.get('rgb.g')}, ${color.get(
            'rgb.b'
          )}, var(--bg-opacity))`,
          text: chroma.contrast(color, 'white') > 2 ? 'white' : 'black',
        }
      }),
    [tags]
  )

  if (!tags.length) {
    return null
  }

  // TODO show filtering as "Everything" if every tag is selected

  return (
    <div
      className="px-inset py-2 text-xs flex flex-no-wrap overflow-x-auto items-center"
      style={{ scrollSnapAlign: 'start', scrollSnapType: 'x proximity' }}
    >
      <span
        className="font-bold text-gray-600"
        style={{ scrollSnapAlign: 'end' }}
      >
        Filter:
      </span>
      {list.map((tag, i) => {
        const active =
          tag.id === ''
            ? selected.size === 1 && selected.has('')
            : selected.has(tag.id)
        return (
          <button
            key={tag.name}
            className={cx(
              'ml-2 px-2 py-1 font-semibold focus:outline-none rounded-full whitespace-pre',
              /*
              // hover:bg-opacity-50 active:bg-opacity-75
              active ? 'bg-opacity-100' : 'bg-opacity-25 ',
              tag.text === 'white'
                ? active
                  ? 'text-gray-800 hover:text-gray-900 '
                  : 'text-gray-800 hover:text-white bg-gray-600 hover:bg-gray-500'
                : active
                ? 'text-gray-100 hover:text-white bg-gray-600 hover:bg-gray-500'
                : 'text-gray-800 hover:text-gray-900 bg-gray-100 bg-opacity-0 hover:bg-gray-200',
                */
              active
                ? 'text-gray-100 hover:text-white bg-gray-600 hover:bg-gray-500'
                : 'text-gray-800 hover:text-gray-900 bg-gray-100 bg-opacity-0 hover:bg-gray-200',
              { 'mr-2': i + 1 === list.length }
            )}
            style={{
              scrollSnapAlign: 'end',
              //backgroundColor: tag.bg,
              //color: tag.text,
            }}
            aria-pressed={active}
            onClick={() => {
              if (tag.id === '') {
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
//
