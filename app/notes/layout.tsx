import Sidebar from '@/components/Sidebar'
import { getNotes } from '@/actions/notes'

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const notes = await getNotes()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-gray-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <aside className="h-full border-r border-white/5 bg-[#0a0a0a] z-20">
        <Sidebar notes={notes} />
      </aside>
      <main className="flex-1 overflow-y-auto flex flex-col h-full bg-[#050505] relative custom-scrollbar">
        {children}
      </main>
    </div>
  )
}
