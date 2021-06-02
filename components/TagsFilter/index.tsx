import cx from 'classnames'
import type { Tags } from 'hooks/tags/types'
import chroma from 'chroma-js'
import { useMemo, memo } from 'react'
import * as React from 'react'
// workaround @types/react being out of date
const useDeferredValue: typeof React.unstable_useDeferredValue =
  // @ts-expect-error
  React.useDeferredValue
const useTransition: typeof React.unstable_useTransition =
  // @ts-expect-error
  React.useTransition

const defaultBg = '#f7fafc'

type Props = {
  tags: Tags
  selected: Set<string | number>
  setSelected: (selected: Set<string | number>) => void
  isComputing: boolean
}
function TagsFilter({ tags, selected, setSelected, isComputing }: Props) {
  const [isPending, startTransition] = useTransition()
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
        className={cx('font-bold text-gray-600 block relative')}
        style={{ scrollSnapAlign: 'end' }}
      >
        <span
          className={cx(
            'transition-all duration-300 transform absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center',
            {
              'scale-75 opacity-0': !isComputing && !isPending,
              'delay-150': isComputing || isPending,
            }
          )}
        >
          <svg
            className="animate-spin w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
        <span
          className={cx('transition-all duration-300 transform block', {
            'scale-75 opacity-0 text-opacity-0 delay-150':
              isComputing || isPending,
          })}
          aria-label="I am deeply sorry for the shitty a11y, will fix!"
        >
          Filter:
        </span>
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
                startTransition(() => {
                  setSelected(nextSelected)
                })
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
