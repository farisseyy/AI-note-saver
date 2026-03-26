import { getNoteById } from '@/actions/notes'
import Editor from '@/components/Editor'
import { redirect } from 'next/navigation'

export default async function NoteEditorPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const { id } = params
  const note = await getNoteById(id)

  if (!note) {
    redirect('/notes')
  }

  return <Editor note={note} />
}
