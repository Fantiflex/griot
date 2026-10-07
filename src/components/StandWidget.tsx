import React from 'react';
import type { Lang, StandMove } from '@shared/types';
import { ui } from '@/lib/i18n';

/**
 * Support robotisé vu de côté : socle, bras à deux servos, téléphone.
 * Il reproduit à l'écran les mêmes mouvements que l'ESP32 reçoit, pour que la démo
 * fonctionne avant la fabrication du matériel et pour visualiser l'état réel ensuite.
 */
export const StandWidget: React.FC<{ pose: StandMove; connected: boolean; lang: Lang; compact?: boolean }> = ({
  pose,
  connected,
  lang,
  compact = false,
}) => {
  const tiltDeg = pose.tilt - 90; // 0 = horizontal, positif = penché vers la table
  const panDeg = pose.pan - 90; // 0 = face
  const transition = `transform ${Math.max(200, pose.ms)}ms cubic-bezier(.4,0,.2,1)`;
  const w = compact ? 120 : 200;
  const h = compact ? 90 : 150;

  return (
    <div className={`rounded-2xl border ${connected ? 'border-emerald-300 bg-emerald-50/60' : 'border-stone-200 bg-white'} p-3 flex ${compact ? 'flex-row items-center gap-3' : 'flex-col items-center gap-2'}`}>
      <svg width={w} height={h} viewBox="0 0 200 150" className="overflow-visible">
        {/* table */}
        <rect x="0" y="138" width="200" height="6" rx="3" fill="#d6d3d1" />
        {/* socle */}
        <rect x="70" y="118" width="60" height="20" rx="6" fill="#44403c" />
        <circle cx="100" cy="128" r="3" fill={connected ? '#10b981' : '#a8a29e'} />
        {/* mât */}
        <rect x="96" y="60" width="8" height="60" rx="3" fill="#57534e" />
        {/* servo pan (vue de dessus miniature) */}
        <g transform="translate(160 30)">
          <circle r="16" fill="#f5f5f4" stroke="#d6d3d1" />
          <g style={{ transition, transform: `rotate(${panDeg}deg)` }}>
            <line x1="0" y1="0" x2="0" y2="-13" stroke="#A36B46" strokeWidth="3" strokeLinecap="round" />
          </g>
          <text y="28" textAnchor="middle" fontSize="9" fill="#78716c">pan {Math.round(pose.pan)}°</text>
        </g>
        {/* pivot tilt + téléphone */}
        <g style={{ transition, transformOrigin: '100px 60px', transform: `rotate(${tiltDeg}deg)` }}>
          <circle cx="100" cy="60" r="7" fill="#A36B46" />
          <rect x="60" y="54" width="80" height="12" rx="6" fill="#1c1917" />
          <rect x="64" y="56" width="72" height="8" rx="4" fill="#292524" />
          <rect x="97" y="56" width="6" height="8" rx="2" fill="#0ea5e9" />
          {/* champ de vision */}
          <path d="M100 66 L72 120 L128 120 Z" fill="rgba(163,107,70,0.15)" />
        </g>
        <text x="100" y="12" textAnchor="middle" fontSize="9" fill="#78716c">tilt {Math.round(pose.tilt)}°</text>
      </svg>
      <div className={`text-xs ${compact ? '' : 'text-center'}`}>
        <div className={`font-bold ${connected ? 'text-emerald-700' : 'text-stone-600'}`}>{connected ? ui('standConnected', lang) : ui('standSimulated', lang)}</div>
        {!compact && <div className="text-stone-400 mt-0.5">ESP32 · 2 servos</div>}
      </div>
    </div>
  );
};
