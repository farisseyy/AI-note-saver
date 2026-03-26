'use client'

import { useState, useEffect } from 'react'
import { Note } from '@/types'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Search, 
  Settings, 
  User, 
  ChevronDown, 
  Sparkles,
  Zap,
  Clock,
  Pin,
  Star,
  Trash2
} from 'lucide-react'
import { createNote, deleteNote } from '@/actions/notes'
import { usePathname, useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export default function Sidebar({ notes }: { notes: Note[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  const createNoteAction = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const newNote = await createNote()
      if (newNote) {
        router.push(`/notes/${newNote.id}`)
      } else {
        alert("Database Upgrade Required: Please ensure you have run the provided SQL script in your Supabase dashboard to support the new features.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const pinnedNotes = notes.filter(n => n.is_pinned)
  const otherNotes = notes.filter(n => !n.is_pinned)

  return (
    <aside className="w-80 flex flex-col bg-[#0a0a0a] border-r border-white/5 h-screen sticky top-0 animate-in slide-in-from-left duration-700">
      {/* Search Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 order border-white/10 rounded-lg">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Notes Repository</span>
        </div>
        
        <button 
          onClick={createNoteAction}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl transition-all active:scale-[0.98] group shadow-xl shadow-emerald-500/10 disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500"
        >
          {isCreating ? (
             <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
          )}
          <span className="font-black uppercase tracking-tighter text-sm">{isCreating ? "Expanding..." : "New Note"}</span>
        </button>

        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search notes..."
            className="w-full bg-[#050505] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/30 transition-all font-medium"
          />
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-8">
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <Pin size={10} className="text-emerald-500" /> Pinned Notes
            </h3>
            <div className="space-y-1">
              {pinnedNotes.map((note) => (
                <div key={note.id} className="relative group">
                  <Link
                    href={`/notes/${note.id}`}
                    className={`flex flex-col gap-1 p-4 rounded-2xl transition-all border ${
                      pathname === `/notes/${note.id}` 
                        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg' 
                        : 'bg-transparent border-transparent hover:bg-white/2'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold tracking-tight truncate pr-6 ${pathname === `/notes/${note.id}` ? 'text-emerald-400' : 'text-gray-300'}`}>
                        {note.title || 'Untitled Note'}
                      </span>
                      {note.is_favorite && <Star size={10} className="text-amber-500 fill-amber-500" />}
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </Link>
                  <button 
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (window.confirm('Delete this intelligence permanentely?')) {
                        await deleteNote(note.id)
                        if (pathname === `/notes/${note.id}`) router.push('/notes')
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Section */}
        <div className="space-y-2 pb-10">
          <h3 className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Recent Notes</h3>
          <div className="space-y-1">
            {otherNotes.map((note) => (
              <div key={note.id} className="relative group">
                <Link
                  href={`/notes/${note.id}`}
                  className={`flex flex-col gap-1 p-4 rounded-2xl transition-all border ${
                    pathname === `/notes/${note.id}` 
                      ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg' 
                      : 'bg-transparent border-transparent hover:bg-white/2'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold tracking-tight truncate pr-6 ${pathname === `/notes/${note.id}` ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {note.title || 'Untitled Note'}
                    </span>
                    {note.is_favorite && <Star size={10} className="text-amber-500 fill-amber-500" />}
                  </div>
                  <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </Link>
                <button 
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (window.confirm('Erase this note forever?')) {
                      await deleteNote(note.id)
                      if (pathname === `/notes/${note.id}`) router.push('/notes')
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="px-4 py-10 text-center space-y-3 opacity-20">
                <Sparkles size={32} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No notes captured yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-[#050505]">
        <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black text-gray-100 truncate tracking-tight">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User Profile'}
            </p>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest truncate">
              {user?.email || 'Active Operative'}
            </p>
          </div>
          <Settings size={16} className="text-gray-700" />
        </button>
      </div>
    </aside>
  )
}
