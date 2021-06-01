import FirebaseAuthCheck from 'components/FirebaseAuthCheck'
import TagsScreen from 'components/screens/tags'
import { useTags } from 'hooks/tags/firebase'

export default function FirebaseTagsScreen() {
  const [tags, { addTag, editTag, deleteTag }] = useTags()

  return (
    <FirebaseAuthCheck>
      <TagsScreen
        tags={tags}
        addTag={addTag}
        editTag={editTag}
        deleteTag={deleteTag}
      />
    </FirebaseAuthCheck>
  )
}
