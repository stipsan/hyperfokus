import TagsScreen from 'components/screens/tags'
import {
  useAddTag,
  useDeleteTag,
  useEditTag,
  useTags,
} from 'hooks/tags/localstorage'

export default function LocalstorageTagsScreen() {
  const tags = useTags()
  const addTag = useAddTag()
  const editTag = useEditTag()
  const deleteTag = useDeleteTag()

  return (
    <TagsScreen
      tags={tags}
      addTag={addTag}
      editTag={editTag}
      deleteTag={deleteTag}
    />
  )
}
