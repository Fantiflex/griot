import React from 'react';

/**
 * Vue de dessus d'une table de huit élèves : un téléphone sur son support au bout de la table,
 * qui parle (ondes) et regarde l'ardoise (cône). Trait fin, monochrome, accent unique.
 */
export const TableIllustration: React.FC<{ caption: string; phoneLabel: string; slateLabel: string }> = ({ caption, phoneLabel, slateLabel }) => {
  const students = [
    [120, 70], [200, 62], [280, 70],
    [120, 250], [200, 258], [280, 250],
    [62, 160], [338, 160],
  ];
  return (
    <figure className="w-full">
      <svg viewBox="36 36 328 244" className="w-full h-auto" role="img" aria-label={caption}>
        <defs>
          <linearGradient id="cone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* table */}
        <rect x="90" y="100" width="220" height="120" rx="14" fill="var(--color-surface)" stroke="var(--color-line-2)" strokeWidth="1.5" />

        {/* élèves */}
        {students.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="17" fill="var(--color-bg)" stroke="var(--color-ink-2)" strokeWidth="1.5" />
            <circle cx={x} cy={y} r="6" fill="var(--color-ink-2)" opacity="0.18" />
          </g>
        ))}

        {/* ardoise */}
        <rect x="186" y="134" width="74" height="52" rx="6" fill="#1f2523" />
        <text x="223" y="168" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="22" fill="rgba(255,255,255,0.85)">
          8
        </text>

        {/* cône de la caméra */}
        <path d="M140 160 L186 132 L186 188 Z" fill="url(#cone)" />

        {/* support + téléphone */}
        <rect x="118" y="146" width="22" height="28" rx="5" fill="var(--color-ink)" />
        <circle cx="134" cy="160" r="3.2" fill="var(--color-accent)" />

        {/* ondes de voix */}
        {[12, 20, 28].map((r, i) => (
          <path
            key={r}
            d={`M ${118 - r * 0.15} ${160 - r} A ${r} ${r} 0 0 0 ${118 - r * 0.15} ${160 + r}`}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.7 - i * 0.2}
          />
        ))}

        {/* légendes */}
        <g fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
          <text x="129" y="138" textAnchor="middle">{phoneLabel}</text>
          <text x="223" y="127" textAnchor="middle">{slateLabel}</text>
        </g>
      </svg>
      <figcaption className="mt-3 text-center text-xs text-muted font-mono">{caption}</figcaption>
    </figure>
  );
};
