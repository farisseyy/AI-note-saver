'use client'

import { useState, useCallback, useEffect } from 'react'
import { Note } from '@/types'
import { updateNote, deleteNote, parsePDF } from '@/actions/notes'
import { useRouter } from 'next/navigation'
import { jsPDF } from 'jspdf'
import { 
  Save, 
  Trash2, 
  Eye, 
  Edit3, 
  MoreHorizontal, 
  Share2, 
  Sparkles,
  Maximize2,
  ChevronLeft,
  Pin,
  Star,
  PenTool,
  Download,
  FileText as FileIcon,
  FileUp
} from 'lucide-react'
import TiptapEditor from './TiptapEditor'
import AIPanel from './AIPanel'
import CanvasEditor from './CanvasEditor'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

export default function Editor({ note }: { note: Note }) {
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content || '')
  const [isPinned, setIsPinned] = useState(note.is_pinned || false)
  const [isFavorite, setIsFavorite] = useState(note.is_favorite || false)
  const [isPreview, setIsPreview] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const debouncedTitle = useDebounce(title, 1000)
  const debouncedContent = useDebounce(content, 1000)
  const [hasChanges, setHasChanges] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setHasChanges(true)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasChanges(true)
  }

  const togglePin = async () => {
    const newVal = !isPinned
    setIsPinned(newVal)
    await updateNote(note.id, { is_pinned: newVal })
  }

  const toggleFavorite = async () => {
    const newVal = !isFavorite
    setIsFavorite(newVal)
    await updateNote(note.id, { is_favorite: newVal })
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const plainText = content.replace(/<[^>]*>/g, '')
    doc.setFontSize(22)
    doc.text(title || 'Untitled Note', 20, 20)
    doc.setFontSize(12)
    const splitText = doc.splitTextToSize(plainText, 170)
    doc.text(splitText, 20, 40)
    doc.save(`${title || 'note'}.pdf`)
  }

  const exportToTxt = () => {
    const plainText = content.replace(/<[^>]*>/g, '')
    const blob = new Blob([plainText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title || 'note'}.txt`
    link.click()
  }

  useEffect(() => {
    if (hasChanges) {
      const saveNote = async () => {
        setIsSaving(true)
        try {
          await updateNote(note.id, { title: debouncedTitle, content: debouncedContent })
          setHasChanges(false)
        } catch (error) {
          console.error('Failed to save', error)
        } finally {
          setIsSaving(true); 
          setTimeout(() => setIsSaving(false), 800);
        }
      }
      saveNote()
    }
  }, [debouncedTitle, debouncedContent, note.id, hasChanges])

  const handleDelete = async () => {
    if (window.confirm('Archive this thought forever?')) {
      setIsDeleting(true)
      try {
        await deleteNote(note.id)
        router.push('/notes')
      } catch (error) {
        console.error('Failed to delete', error)
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] relative animate-in fade-in duration-700">
      {/* AI Panel integration */}
      {showAIPanel && <AIPanel content={content} onClose={() => setShowAIPanel(false)} />}

      {/* Premium Editor Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-10 py-5 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-30 transition-all">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/notes')}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all md:hidden"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/2 border border-white/10 group animate-in fade-in duration-1000">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Intelligence Operative</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/2 border border-white/5">
            <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${isSaving ? 'bg-emerald-500 animate-pulse scale-125' : hasChanges ? 'bg-amber-500' : 'bg-emerald-500/30'}`} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
              {isSaving ? 'Syncing...' : hasChanges ? 'Unsaved' : 'Synced'}
            </span>
          </div>

          <div className="h-6 w-px bg-white/10 mx-2" />
          
          <div className="flex items-center gap-2">
            <button
               onClick={exportToPDF}
               className="p-2.5 text-gray-600 hover:text-white hover:bg-white/5 rounded-xl transition-all"
               title="Export as PDF"
            >
              <Download size={18} />
            </button>

            <div className="relative">
              <input 
                type="file"
                id="file-import"
                className="hidden"
                accept=".txt,.md,.pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  
                  const isTextLike = file.name.endsWith('.txt') || file.name.endsWith('.md')
                  const isPDF = file.name.endsWith('.pdf')
                  
                  if (!isTextLike && !isPDF) {
                    alert(`Current version (v1) only supports text-based intelligence (.txt, .md, .pdf). Binary parsing for "${file.name}" is coming in a future update.`)
                    e.target.value = ''
                    return
                  }

                  const limit = 100 * 1024 * 1024; // 100MB limit for all files
                  if (file.size > limit) {
                    alert(`Maximum file size (100MB) exceeded. "${file.name}" is too large for processing.`)
                    e.target.value = ''
                    return
                  }
                  
                  try {
                    let text = ''
                    if (isPDF) {
                      const formData = new FormData()
                      formData.append('file', file)
                      text = await parsePDF(formData)
                    } else {
                      text = await file.text()
                    }

                    const lines = text.split('\n')
                    const formatted = lines
                      .map(line => line.trim().length > 0 ? `<p>${line}</p>` : '<br/>')
                      .join('')
                    
                    handleContentChange(formatted)
                    alert(`Successfully imported intelligence: ${file.name}`)
                  } catch (err) {
                    console.error(err)
                    alert('Failed to read file. Please ensure it is a valid text or PDF file.')
                  } finally {
                    e.target.value = ''
                  }
                }}
              />
              <label 
                htmlFor="file-import"
                className="p-2.5 text-gray-600 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer block"
                title="Import .txt, .md, or .pdf"
              >
                <FileUp size={18} />
              </label>
            </div>

            <button
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              {isPreview ? <Edit3 size={14} className="text-emerald-500" /> : <Eye size={14} />}
              <span className="hidden sm:inline">{isPreview ? 'Edit' : 'Preview'}</span>
            </button>
            
            <button 
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black ${showAIPanel ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'} border rounded-2xl hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all active:scale-[0.98] group`}
            >
              <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
              <span>AI ASSISTANT</span>
            </button>

            <button
               onClick={handleDelete}
               disabled={isDeleting}
               className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-10 py-16 pb-40 overflow-y-auto custom-scrollbar">
        {showCanvas ? (
           <CanvasEditor onSave={(data) => console.log('Canvas Saved:', data)} />
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Separate Title Box */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={togglePin}
                    className={`p-2 rounded-xl transition-all ${isPinned ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}
                  >
                    <Pin size={22} className={isPinned ? 'fill-emerald-500' : ''} />
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    className={`p-2 rounded-xl transition-all ${isFavorite ? 'text-amber-500 bg-amber-500/10' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}
                  >
                    <Star size={22} className={isFavorite ? 'fill-amber-500' : ''} />
                  </button>
                </div>
              </div>
              
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Title of this expansion..."
                className="w-full text-5xl font-black bg-transparent border-none outline-none text-white placeholder-gray-800 tracking-tighter selection:bg-emerald-500/20"
              />
              <div className="h-px w-full bg-gradient-to-r from-emerald-500/30 via-white/5 to-transparent" />
            </div>

            {/* Note Content Box */}
            {isPreview ? (
              <div className="prose prose-invert prose-emerald max-w-none 
                prose-headings:font-black prose-headings:tracking-tighter 
                prose-p:text-gray-400 prose-p:leading-relaxed prose-p:text-lg
                prose-strong:text-white prose-strong:font-bold
                prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-2xl
                animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            ) : (
              <div className="relative min-h-[600px] border border-transparent focus-within:border-emerald-500/10 rounded-3xl transition-all">
                <TiptapEditor content={content} onChange={handleContentChange} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Floating Footnote */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-1000">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          Focus Mode Active
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="text-[10px] font-bold text-gray-400">
           {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} Words
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
