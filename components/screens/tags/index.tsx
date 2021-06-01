/* eslint-disable no-restricted-globals */
import cx from 'classnames'
import AnimatedDialog from 'components/AnimatedDialog'
import Button, { className } from 'components/Button'
import DialogToolbar from 'components/DialogToolbar'
import type { Tags, AddTag, EditTag, DeleteTag } from 'hooks/tags/types'
import type { Tag } from 'database/types'
import { useAnalytics } from 'hooks/analytics'
import { nanoid } from 'nanoid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useReducer, useState } from 'react'
import styles from './index.module.css'

const TrackCreateDialog = () => {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'New Tag',
    })
  }, [analytics])

  return null
}

const CreateDialog = ({ addTag }: { addTag: AddTag }) => {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'New Tag',
    })
  }, [analytics])

  const router = useRouter()
  const close = () => {
    router.push(router.pathname, undefined, { shallow: true })
  }

  return (
    <AnimatedDialog
      isOpen={!!router.query.create}
      onDismiss={close}
      aria-label="Create new tag"
    >
      <TagForm
        onDismiss={close}
        onSubmit={async (state) => {
          await addTag({ ...state, id: nanoid() })
          close()
          analytics.logEvent('tag_create', {
            color: state.color,
          })
        }}
      />
      <TrackCreateDialog />
    </AnimatedDialog>
  )
}

type FormActions =
  | { type: 'reset'; payload: Tag }
  | { type: 'change'; payload: { name: string; value: unknown } }
function reducer(state: Tag, action: FormActions) {
  switch (action.type) {
    case 'reset':
      return action.payload
    case 'change':
      return { ...state, [action.payload.name]: action.payload.value }
    default:
      return state
  }
}

const TagForm = ({
  initialState = {
    id: '',
    name: '',
    color: '',
  },
  onDismiss,
  onSubmit,
  editing,
  onDelete,
}: {
  initialState?: Tag
  editing?: boolean
  onDismiss: () => void
  onSubmit: (state: Tag) => void
  onDelete?: () => void
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        onSubmit(state)
      }}
    >
      <div className="block">
        <label className="block text-gray-700" htmlFor="name">
          Name
        </label>
        <div className="mt-1">
          <input
            required
            className="form-input mt-1 block w-full"
            type="text"
            autoComplete="off"
            id="name"
            name="name"
            value={state.name}
            onChange={({ target: { name, value } }) =>
              dispatch({ type: 'change', payload: { name, value } })
            }
          />
        </div>
      </div>
      <div className="py-1" />
      <DialogToolbar
        left={
          onDelete ? (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          ) : undefined
        }
        right={
          <>
            <Button variant="default" onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </>
        }
      />
    </form>
  )
}

const TrackEditDialog = () => {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'Edit Tag',
    })
  }, [analytics])

  return null
}
const EditDialog = ({
  tags,
  editTag,
  deleteTag,
}: {
  tags: Tags
  editTag: EditTag
  deleteTag: DeleteTag
}) => {
  const analytics = useAnalytics()
  const router = useRouter()
  const [initialState, setInitialState] = useState(() =>
    tags.find((tag) => tag.id === router.query.edit)
  )

  useEffect(() => {
    if (router.query.edit) {
      const nextInitialState = tags.find((tag) => tag.id === router.query.edit)
      if (nextInitialState) {
        setInitialState(nextInitialState)
      }

      // Handle focus on blur
      const tagId = router.query.edit
      return () => {
        setTimeout(() => {
          const focusNode = document.querySelector(
            `a[data-focus="${tagId}"]`
          ) as HTMLElement
          focusNode?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          focusNode?.focus()
        }, 300)
      }
    }
  }, [router.query.edit, tags])

  const close = () => {
    router.push(router.pathname, undefined, { shallow: true })
  }

  return (
    <AnimatedDialog
      // TODO temporary workaround for rapid clicking different tags and form not refreshing
      key={initialState?.id}
      isOpen={
        !!router.query.edit &&
        !!initialState &&
        router.query.edit === initialState.id
      }
      onDismiss={close}
      aria-label="Edit tag"
    >
      <TagForm
        editing
        initialState={initialState}
        onDismiss={close}
        onSubmit={async (state) => {
          await editTag(state, initialState.id)
          /*
          setTags((tags) => {
            const index = tags.findIndex((tag) => tag.id === initialState.id)

            const newTags = replaceItemAtIndex(tags, index, {
              ...tags[index],
              start: state.start,
              duration: state.duration,
              end: state.end,
              repeat: state.repeat,
              enabled: state.enabled,
            })
            return newTags
          })
          // */
          setInitialState(state)
          close()
          analytics.logEvent('tag_edit', {
            color: state.color,
          })
        }}
        onDelete={async () => {
          if (
            confirm(`Are you sure you want to delete "${initialState.name}"?`)
          ) {
            await deleteTag(initialState.id)
            /* 
            setTags((tags) => {
              const index = tags.findIndex((tag) => tag.id === initialState.id)
              const newTags = removeItemAtIndex(tags, index)
              return newTags
            }) 
            // */
            close()
            analytics.logEvent('tag_delete', {
              color: initialState.color,
            })
          }
        }}
      />
      <TrackEditDialog />
    </AnimatedDialog>
  )
}

const NoTagsPlaceholder = () => {
  return (
    <div className="px-5 py-24 mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl font-medium title-font text-gray-900">No tags</h1>

      <Link href="?create=true" shallow>
        <a
          className={cx(
            className({ variant: 'primary' }),
            'mt-10 relative z-40',
            styles.notagslink
          )}
        >
          New tag
        </a>
      </Link>
      <div
        className={cx(
          styles.notagslinkBackdrop,
          'fixed left-0 top-0 right-0 bottom-0 z-30 pointer-events-none'
        )}
      />
    </div>
  )
}

export default function TagsScreen({
  tags,
  addTag,
  editTag,
  deleteTag,
}: {
  tags: Tags
  addTag: AddTag
  editTag: EditTag
  deleteTag: DeleteTag
}) {
  const analytics = useAnalytics()
  useEffect(() => {
    analytics.logEvent('screen_view', {
      app_name: process.env.NEXT_PUBLIC_APP_NAME,
      screen_name: 'Tags',
    })
  }, [analytics])

  return (
    <div className={cx({ 'border-b-2': tags.length > 0 })}>
      {tags.length < 1 && <NoTagsPlaceholder />}
      {tags.map((tag) => {
        return (
          <Link shallow key={tag.id} href={`?edit=${tag.id}`}>
            <a
              data-focus={tag.id}
              className={cx(
                styles.tag,
                'block px-inset py-6 hover:bg-gray-200 focus:bg-gray-100 active:bg-gray-200 focus:outline-none border-t-2 text-gray-600 whitespace-pre'
              )}
            >
              {tag.name}
            </a>
          </Link>
        )
      })}
      <EditDialog tags={tags} editTag={editTag} deleteTag={deleteTag} />
      <CreateDialog addTag={addTag} />
    </div>
  )
}
