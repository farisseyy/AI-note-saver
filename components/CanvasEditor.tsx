'use client'

import { useRef, useState } from 'react'
import CanvasDraw from 'react-canvas-draw'
import { Eraser, RotateCcw, Save, Trash2 } from 'lucide-react'

type CanvasEditorProps = {
  onSave: (data: string) => void
  initialData?: string
}

export default function CanvasEditor({ onSave, initialData }: CanvasEditorProps) {
  const canvasRef = useRef<CanvasDraw>(null)
  const [brushColor, setBrushColor] = useState('#4ade80')

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] rounded-3xl overflow-hidden border border-white/5">
      <div className="p-4 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-2">
           <button 
             onClick={() => setBrushColor('#4ade80')}
             className={`w-6 h-6 rounded-full border-2 ${brushColor === '#4ade80' ? 'border-white' : 'border-transparent'} transition-all`}
             style={{ backgroundColor: '#4ade80' }}
           />
           <button 
             onClick={() => setBrushColor('#ffffff')}
             className={`w-6 h-6 rounded-full border-2 ${brushColor === '#ffffff' ? 'border-white' : 'border-transparent'} transition-all`}
             style={{ backgroundColor: '#ffffff' }}
           />
           <button 
             onClick={() => setBrushColor('#ef4444')}
             className={`w-6 h-6 rounded-full border-2 ${brushColor === '#ef4444' ? 'border-white' : 'border-transparent'} transition-all`}
             style={{ backgroundColor: '#ef4444' }}
           />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => canvasRef.current?.undo()}
            className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={() => canvasRef.current?.clear()}
            className="p-2 hover:bg-white/5 text-gray-400 hover:text-red-500 rounded-xl transition-all"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => {
              const data = canvasRef.current?.getSaveData()
              if (data) onSave(data)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-xl hover:bg-emerald-400 transition-all"
          >
            <Save size={14} />
            Keep Drawing
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white/[0.02] cursor-crosshair">
        <CanvasDraw
          ref={canvasRef}
          brushColor={brushColor}
          brushRadius={2}
          canvasWidth={1000}
          canvasHeight={800}
          lazyRadius={0}
          saveData={initialData}
          backgroundColor="transparent"
          gridColor="rgba(255,255,255,0.03)"
        />
      </div>
    </div>
  )
}
