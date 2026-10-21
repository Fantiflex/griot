import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

/** Ardoise où l'on écrit au doigt ou à la souris. Encre blanche (craie) sur fond transparent. */
export interface SlateHandle {
  canvas: () => HTMLCanvasElement | null;
  clear: () => void;
  isEmpty: () => boolean;
  /** Écrit un texte (pour « taper à la place » ou pour l'animation de démonstration). */
  writeText: (text: string) => void;
}

export const SlateCanvas = forwardRef<SlateHandle, { disabled?: boolean; placeholder: string; scanning?: boolean; onChange?: (empty: boolean) => void }>(
  ({ disabled, placeholder, scanning, onChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    const [empty, setEmpty] = useState(true);

    const setEmptyState = useCallback(
      (v: boolean) => {
        setEmpty(v);
        onChange?.(v);
      },
      [onChange],
    );

    // Résolution interne = taille affichée × densité de pixels
    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;
      const resize = () => {
        const r = c.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.round(r.width * dpr);
        const h = Math.round(r.height * dpr);
        if (c.width !== w || c.height !== h) {
          c.width = w;
          c.height = h;
          setEmptyState(true);
        }
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(c);
      return () => ro.disconnect();
    }, [setEmptyState]);

    const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const c = canvasRef.current!;
      const r = c.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
    };

    const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (!c || !ctx) return;
      ctx.strokeStyle = 'rgba(250,248,240,0.95)';
      ctx.lineWidth = Math.max(6, c.height * 0.075);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    };

    const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drawing.current = true;
      const p = pos(e);
      last.current = p;
      stroke(p, { x: p.x + 0.1, y: p.y + 0.1 });
      if (empty) setEmptyState(false);
    };
    const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current || disabled) return;
      const p = pos(e);
      if (last.current) stroke(last.current, p);
      last.current = p;
    };
    const up = () => {
      drawing.current = false;
      last.current = null;
    };

    useImperativeHandle(ref, () => ({
      canvas: () => canvasRef.current,
      clear: () => {
        const c = canvasRef.current;
        c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
        setEmptyState(true);
      },
      isEmpty: () => empty,
      writeText: (text: string) => {
        const c = canvasRef.current;
        const ctx = c?.getContext('2d');
        if (!c || !ctx) return;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = 'rgba(250,248,240,0.95)';
        ctx.font = `600 ${Math.round(c.height * 0.62)}px Caveat, "Comic Sans MS", cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // espacement entre chiffres pour un découpage fiable
        const chars = text.split('');
        const step = c.height * 0.42;
        const startX = c.width / 2 - ((chars.length - 1) * step) / 2;
        chars.forEach((ch, i) => ctx.fillText(ch, startX + i * step, c.height * 0.54));
        setEmptyState(text.trim().length === 0);
      },
    }));

    return (
      <div className="slate relative rounded-xl border-[5px] border-[#6b4f36] overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`block w-full h-36 touch-none ${disabled ? 'cursor-default' : 'cursor-crosshair'}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
          aria-label={placeholder}
          role="img"
        />
        {empty && !disabled && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-chalk text-2xl text-white/30">{placeholder}</div>
        )}
        {scanning && <div className="pointer-events-none absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-accent/35 to-transparent animate-scan" />}
      </div>
    );
  },
);
SlateCanvas.displayName = 'SlateCanvas';
