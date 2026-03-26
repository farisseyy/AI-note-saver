import { Sparkles } from 'lucide-react'

export default function NotesPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 h-full bg-[#050505] select-none animate-in fade-in duration-1000">
      <div className="flex flex-col items-center justify-center p-16 max-w-sm w-full border border-white/5 rounded-[3rem] bg-white/2 backdrop-blur-3xl shadow-2xl">
        <div className="h-20 w-20 mb-8 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20 border border-emerald-500/20">
          <Sparkles size={40} className="animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tighter mb-3 uppercase">Select Intelligence</h2>
        <p className="text-xs text-center text-gray-500 leading-relaxed font-bold uppercase tracking-[0.2em] px-8 opacity-50">
          Choose a repository or capture a new thought to begin your expansion.
        </p>
      </div>
    </div>
  )
}
