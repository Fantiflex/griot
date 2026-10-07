import React from 'react';
import type { Lang, StandMove } from '@shared/types';
import { ui } from '@/lib/i18n';

/**
 * Support robotisé vu de côté : socle, mât, pivot et téléphone. Trait fin, monochrome.
 * Il reproduit les mouvements envoyés à l'ESP32, pour la démo sans matériel et comme
 * témoin de l'état réel ensuite.
 */
export const StandWidget: React.FC<{ pose: StandMove; connected: boolean; lang: Lang; compact?: boolean; dark?: boolean }> = ({
  pose,
  connected,
  lang,
  compact = false,
  dark = false,
}) => {
  const tiltDeg = pose.tilt - 90;
  const panDeg = pose.pan - 90;
  const transition = `transform ${Math.max(200, pose.ms)}ms cubic-bezier(.4,0,.2,1)`;
  const w = compact ? 110 : 200;
  const h = compact ? 82 : 150;
  const stroke = dark ? 'rgba(255,255,255,0.55)' : '#4a4641';
  const faint = dark ? 'rgba(255,255,255,0.18)' : '#e7e3dd';
  const text = dark ? 'rgba(255,255,255,0.45)' : '#8a847c';
  const accent = 'var(--color-accent)';
  const ok = 'var(--color-ok)';

  return (
    <div className={`flex ${compact ? 'flex-row items-center gap-3' : 'flex-col items-center gap-2'} ${dark ? '' : 'card p-3'}`}>
      <svg width={w} height={h} viewBox="0 0 200 150" className="overflow-visible">
        <line x1="20" y1="140" x2="180" y2="140" stroke={faint} strokeWidth="2" />
        <rect x="74" y="122" width="52" height="16" rx="4" fill="none" stroke={stroke} strokeWidth="2" />
        <circle cx="100" cy="130" r="2.5" fill={connected ? ok : faint} />
        <line x1="100" y1="122" x2="100" y2="62" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <g transform="translate(164 28)">
          <circle r="14" fill="none" stroke={faint} strokeWidth="1.5" />
          <g style={{ transition, transform: `rotate(${panDeg}deg)` }}>
            <line x1="0" y1="0" x2="0" y2="-11" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <text y="26" textAnchor="middle" fontSize="8.5" fill={text} fontFamily="var(--font-mono)">{Math.round(pose.pan)}°</text>
        </g>
        <g style={{ transition, transformOrigin: '100px 60px', transform: `rotate(${tiltDeg}deg)` }}>
          <circle cx="100" cy="60" r="5" fill={accent} />
          <rect x="62" y="54.5" width="76" height="11" rx="5.5" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="100" cy="60" r="1.5" fill={dark ? '#fff' : '#141311'} />
          <path d="M100 66 L74 118 L126 118 Z" fill={dark ? 'rgba(180,85,47,0.14)' : 'rgba(180,85,47,0.10)'} />
        </g>
        <text x="100" y="14" textAnchor="middle" fontSize="8.5" fill={text} fontFamily="var(--font-mono)">{Math.round(pose.tilt)}°</text>
      </svg>
      <div className={`text-xs ${compact ? '' : 'text-center'}`}>
        <div className={`font-medium ${connected ? 'text-ok' : dark ? 'text-white/60' : 'text-ink-2'}`}>{connected ? ui('standConnected', lang) : ui('standSimulated', lang)}</div>
        {!compact && <div className={`mt-0.5 ${dark ? 'text-white/40' : 'text-muted'}`}>ESP32 · pan / tilt</div>}
      </div>
    </div>
  );
};
