'use client'

import { useState } from 'react'
import { 
  Sparkles, 
  FileText, 
  List, 
  HelpCircle, 
  Languages, 
  Network,
  X,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { summarizeNote, generateKeyPoints } from '@/actions/ai'

type AIPanelProps = {
  content: string
  onClose: () => void
}

export default function AIPanel({ content, onClose }: AIPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const handleAction = async (action: string, fn: (c: string) => Promise<any>) => {
    setLoading(action)
    const res = await fn(content)
    setResult(Array.isArray(res) ? res.map(p => `• ${p}`).join('\n') : res)
    setLoading(null)
  }

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-[#0a0a0a] border-l border-white/5 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-500">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-500" />
          <h3 className="font-black text-white tracking-tight uppercase text-sm">AI intelligence</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {!result ? (
          <div className="space-y-4">
             <div className="px-2 mb-2">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-loose">Core Intelligence Tools</p>
             </div>

             <button 
               onClick={() => handleAction('summarize', summarizeNote)}
               disabled={!!loading}
               className="w-full flex items-center gap-4 p-5 bg-white/2 border border-white/5 rounded-2xl hover:border-emerald-500/30 hover:bg-emerald-500/5 group transition-all"
             >
               <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                 {loading === 'summarize' ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
               </div>
               <div className="text-left flex-1">
                 <p className="text-sm font-black text-gray-100 uppercase tracking-tight">Summarize</p>
                 <p className="text-[10px] text-gray-500 font-medium">Generate a high-density intelligence synthesis.</p>
               </div>
               <ChevronRight size={14} className="text-gray-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
             </button>

             <button 
               onClick={() => handleAction('key-points', generateKeyPoints)}
               disabled={!!loading}
               className="w-full flex items-center gap-4 p-5 bg-white/2 border border-white/5 rounded-2xl hover:border-indigo-500/30 hover:bg-indigo-500/5 group transition-all"
             >
               <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 group-hover:scale-110 transition-transform">
                 {loading === 'key-points' ? <Loader2 className="animate-spin" size={20} /> : <List size={20} />}
               </div>
               <div className="text-left flex-1">
                 <p className="text-sm font-black text-indigo-400 uppercase tracking-tight">Extract Keys</p>
                 <p className="text-[10px] text-gray-500 font-medium">Identify core highlights and action items.</p>
               </div>
               <ChevronRight size={14} className="text-gray-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
             </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500 h-full flex flex-col">
            <div className="flex-1 bg-white/2 rounded-2xl p-4 border border-white/5 font-medium text-xs leading-relaxed text-gray-300 whitespace-pre-wrap overflow-y-auto max-h-[60vh] custom-scrollbar">
              {result}
            </div>
            <div className="grid grid-cols-2 gap-2 pb-8">
               <button 
                 onClick={() => setResult(null)}
                 className="py-3 px-4 rounded-xl border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:bg-white/5 transition-all"
               >
                 Back to Tools
               </button>
               <button 
                 onClick={() => {
                   // In a real app we'd insert this into the editor. For now, copy to clipboard
                   navigator.clipboard.writeText(result)
                   alert('Result copied to clipboard!')
                 }}
                 className="py-3 px-4 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
               >
                 Copy Result
               </button>
            </div>
          </div>
        )}
      </div>

      {!result && (
        <div className="p-6 border-t border-white/5 bg-[#050505]/50 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 mb-2">
             <div className="h-1 w-1 bg-emerald-500 rounded-full" />
             <div className="h-1 w-1 bg-emerald-500 rounded-full opacity-50" />
             <div className="h-1 w-1 bg-emerald-500 rounded-full opacity-20" />
          </div>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Powered by Deepmind AI Engine</p>
        </div>
      )}
    </div>
  )
}
