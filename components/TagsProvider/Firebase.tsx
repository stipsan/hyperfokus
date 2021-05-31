import Button from 'components/Button'
import type { Tag } from 'database/types'
import type { User } from 'firebase/app'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import {
  AuthCheck,
  useFirestore,
  useFirestoreCollectionData,
  useUser,
} from 'reactfire'
import type { TagsContext } from './Context'
import { Provider } from './Context'

type TagDoc = {
  author?: string
} & Tag

const TagsProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser<User>()
  const firestore = useFirestore()
  const tagsRef = firestore.collection('tags').where('author', '==', user.uid)
  const tagsData = useFirestoreCollectionData<TagDoc>(
    tagsRef.orderBy('name', 'asc'),
    { idField: 'id' }
  )
  const tags = useMemo(
    () =>
      tagsData.map((tag) => {
        const { id, name, color } = tag
        return { id, name, color }
      }),
    [tagsData]
  )

  const context = useMemo(
    (): TagsContext => ({
      tags,
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
    [tags, firestore, user.uid]
  )

  return <Provider value={context}>{children}</Provider>
}

const Firebase = ({ children }: { children: ReactNode }) => (
  <AuthCheck
    fallback={
      <>
        <Link href="/settings">
          <Button className="block mx-auto mt-32" variant="primary">
            Login
          </Button>
        </Link>
      </>
    }
  >
    <TagsProvider>{children}</TagsProvider>
  </AuthCheck>
)

export default Firebase
