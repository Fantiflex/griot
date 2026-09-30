import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, Sparkles, Move, PenTool, Check } from 'lucide-react';
import { playDjembeSlap } from '../utils/audio';

interface StickItem {
  id: number;
  x: number;
  y: number;
  angle: number; // in degrees
  length: number;
  color: string;
}

export const InteractiveSlate: React.FC<{
  onSaveNote?: (text: string) => void;
  initialNote?: string;
}> = ({ onSaveNote, initialNote }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'draw' | 'sticks'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [chalkColor, setChalkColor] = useState<string>('#FFFFFF');
  const [chalkSize, setChalkSize] = useState<number>(3);
  
  // Virtual Sticks for hands-on geometry
  const [sticks, setSticks] = useState<StickItem[]>([
    { id: 1, x: 50, y: 70, angle: 0, length: 70, color: '#E5A823' },
    { id: 2, x: 130, y: 70, angle: 45, length: 70, color: '#E5A823' },
    { id: 3, x: 190, y: 120, angle: 90, length: 70, color: '#E5A823' },
    { id: 4, x: 190, y: 200, angle: 135, length: 70, color: '#E5A823' },
    { id: 5, x: 130, y: 250, angle: 180, length: 70, color: '#E5A823' },
    { id: 6, x: 50, y: 250, angle: 225, length: 70, color: '#E5A823' },
    { id: 7, x: 0, y: 200, angle: 270, length: 70, color: '#E5A823' },
    { id: 8, x: 0, y: 120, angle: 315, length: 70, color: '#E5A823' },
  ]);

  const [activeStickId, setActiveStickId] = useState<number | null>(null);
  const [isDraggingStick, setIsDraggingStick] = useState(false);

  // Initialize canvas with dark blackboard background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = '#1c2422';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Add subtle chalkboard grit texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * rect.width;
      const ry = Math.random() * rect.height;
      ctx.fillRect(rx, ry, 1, 1);
    }
  }, []);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const mouseEvent = e as React.MouseEvent;
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === 'sticks') return;
    const { x, y } = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = chalkColor;
    ctx.lineWidth = chalkSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode === 'sticks') return;
    const { x, y } = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSlate = () => {
    playDjembeSlap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#1c2422';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const rotateStick = (id: number) => {
    playDjembeSlap();
    setSticks(prev =>
      prev.map(s => (s.id === id ? { ...s, angle: (s.angle + 45) % 360 } : s))
    );
  };

  const resetSticks = () => {
    playDjembeSlap();
    setSticks([
      { id: 1, x: 50, y: 70, angle: 0, length: 70, color: '#E5A823' },
      { id: 2, x: 130, y: 70, angle: 45, length: 70, color: '#E5A823' },
      { id: 3, x: 190, y: 120, angle: 90, length: 70, color: '#E5A823' },
      { id: 4, x: 190, y: 200, angle: 135, length: 70, color: '#E5A823' },
      { id: 5, x: 130, y: 250, angle: 180, length: 70, color: '#E5A823' },
      { id: 6, x: 50, y: 250, angle: 225, length: 70, color: '#E5A823' },
      { id: 7, x: 0, y: 200, angle: 270, length: 70, color: '#E5A823' },
      { id: 8, x: 0, y: 120, angle: 315, length: 70, color: '#E5A823' },
    ]);
  };

  return (
    <div className="bg-[#1A1817] p-3 sm:p-4 rounded-3xl border-3 border-[#1A1817] dair-shadow text-white space-y-3">
      
      {/* Slate Top Header & Tool Switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E5A823] animate-pulse" />
          <h4 className="font-serif font-black text-sm text-[#FBF8EE] tracking-wide">
            L'Ardoise Magique & Bâtons
          </h4>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-700">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              mode === 'draw'
                ? 'bg-[#E5A823] text-stone-950 font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <PenTool className="w-3 h-3" />
            <span>Craie</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('sticks')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              mode === 'sticks'
                ? 'bg-[#E5A823] text-stone-950 font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Move className="w-3 h-3" />
            <span>8 Bâtons</span>
          </button>
        </div>
      </div>

      {/* Blackboard Surface */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-stone-700 bg-[#1c2422] shadow-inner select-none touch-none">
        
        {/* HTML5 Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 w-full h-full cursor-crosshair ${
            mode === 'sticks' ? 'pointer-events-none opacity-80' : 'pointer-events-auto'
          }`}
        />

        {/* Sticks Manipulator Layer */}
        {mode === 'sticks' && (
          <div className="absolute inset-0 p-4 pointer-events-auto">
            <div className="absolute top-2 left-3 text-[10px] text-[#E5A823] bg-stone-950/80 px-2 py-0.5 rounded-full font-bold">
              💡 Touche un bâton pour le faire pivoter (45°) et former un polygone !
            </div>

            {sticks.map(stick => (
              <div
                key={stick.id}
                onClick={() => rotateStick(stick.id)}
                style={{
                  left: `${stick.x}px`,
                  top: `${stick.y}px`,
                  width: `${stick.length}px`,
                  transform: `rotate(${stick.angle}deg)`,
                  transformOrigin: '0 50%',
                }}
                className="absolute h-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] rounded-full border-2 border-[#78350F] cursor-pointer hover:brightness-125 shadow-md flex items-center justify-between px-1 transition-transform active:scale-105"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                <span className="text-[8px] font-black text-stone-900 select-none">{stick.id}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slate Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
        {mode === 'draw' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 text-[11px] font-bold">Couleur craie:</span>
            {[
              { color: '#FFFFFF', label: 'Blanc' },
              { color: '#FCD34D', label: 'Jaune Or' },
              { color: '#6EE7B7', label: 'Émeraude' },
              { color: '#FCA5A5', label: 'Terre' },
            ].map(c => (
              <button
                key={c.color}
                type="button"
                onClick={() => setChalkColor(c.color)}
                style={{ backgroundColor: c.color }}
                title={c.label}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  chalkColor === c.color ? 'border-white scale-110 shadow-sm' : 'border-stone-800'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetSticks}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-[#FBF8EE] rounded-lg text-xs font-bold transition-colors"
            >
              Réinitialiser l'octogone
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={clearSlate}
          className="px-3 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-rose-800/50"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Effacer l'ardoise</span>
        </button>
      </div>

    </div>
  );
};
