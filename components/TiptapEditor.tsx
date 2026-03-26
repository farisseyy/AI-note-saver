'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect } from 'react'

type TiptapEditorProps = {
  content: string
  onChange: (content: string) => void
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start capturing your intelligence...',
      }),
      CharacterCount,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-emerald max-w-none focus:outline-none min-h-[500px] py-10 text-xl font-medium text-gray-300 leading-relaxed',
      },
    },
  })

  // Sync content if it changes externally (e.g. from props)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="relative group min-h-[500px]">
      <EditorContent editor={editor} />
      
      {/* Floating Toolbar (Simplified for now) */}
      <div className="absolute -left-14 top-10 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2 p-1 bg-[#0a0a0a] border border-white/5 rounded-xl shadow-2xl">
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-500/10 hover:text-emerald-400 transition-all ${editor.isActive('heading', { level: 1 }) ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-600'}`}
        >
          H1
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 transition-all ${editor.isActive('bold') ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-600'}`}
        >
          B
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 transition-all ${editor.isActive('codeBlock') ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-600'}`}
        >
          {`</>`}
        </button>
      </div>
    </div>
  )
}
