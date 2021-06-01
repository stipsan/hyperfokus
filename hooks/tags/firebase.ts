import type { Tag } from 'database/types'
import type { User } from 'firebase/app'
import { useMemo } from 'react'
import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire'
import type { AddTag, DeleteTag, EditTag, Tags } from './types'

type TagDoc = {
  author?: string
} & Tag

type Actions = {
  addTag: AddTag
  editTag: EditTag
  deleteTag: DeleteTag
}

export function useTags(): [Tags, Actions] {
  const user = useUser<User>()
  const firestore = useFirestore()
  const tagsRef = firestore.collection('tags').where('author', '==', user.uid)
  const tagsData = useFirestoreCollectionData<TagDoc>(
    tagsRef.orderBy('name', 'asc'),
    { idField: 'id' }
  )
  const tags = useMemo<Tags>(
    () =>
      tagsData.map((tag) => {
        const { id, name, color } = tag
        return { id, name, color }
      }),
    [tagsData]
  )

  const actions = useMemo<Actions>(
    () => ({
      addTag: async ({ name, color }) => {
        const data = { author: user.uid, name, color }

        const ref = await firestore.collection('tags').add(data)

        return { id: ref.id }
      },
      editTag: async ({ name, color }, id) => {
        const data = { name, color }

        await firestore.collection('tags').doc(id).update(data)
      },
      deleteTag: async (id) => {
        await firestore.collection('tags').doc(id).delete()
      },
    }),
    [firestore, user.uid]
  )

  return [tags, actions]
}
