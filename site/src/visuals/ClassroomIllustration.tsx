import React from 'react';

/**
 * Une classe de 80 élèves vue du dessus : 10 tables de 8, un téléphone au centre de chacune,
 * l'enseignant au tableau. Dessin vectoriel généré, net à toutes les tailles.
 */

const SKIN = ['#5a3825', '#6b4330', '#7c4f37', '#4a2e1f', '#8a5b3f', '#634030'];
const UNIFORM = ['#3f7f5c', '#3b6e9e', '#f3efe7', '#3f7f5c', '#c08a3e', '#3b6e9e', '#f3efe7', '#3f7f5c'];
const HAIR = '#1b1310';

const TABLE_W = 112;
const TABLE_H = 62;
const COLS = 5;
const ROWS = 2;
const GAP_X = 62;
const GAP_Y = 74;
const ORIGIN_X = 70;
const ORIGIN_Y = 168;

// pseudo-aléatoire stable : la même image à chaque rendu
const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(Math.floor(Math.sin(seed * 12.9898) * 43758.5453)) % arr.length];

/** Un élève vu de dessus, tourné vers (dx, dy) = direction de la table. */
const Student: React.FC<{ x: number; y: number; angle: number; seed: number; highlight?: boolean; shirt?: string }> = ({ x, y, angle, seed, highlight, shirt }) => {
  const skin = pick(SKIN, seed);
  const uniform = shirt ?? pick(UNIFORM, seed + 3);
  const light = uniform === '#f3efe7';
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* épaules */}
      <ellipse cx="0" cy="3" rx="12.5" ry="7.5" fill={uniform} stroke={light ? '#d9d2c5' : 'none'} strokeWidth="1" />
      {/* bras vers la table */}
      <rect x="-12" y="-6" width="5" height="9" rx="2.5" fill={skin} />
      <rect x="7" y="-6" width="5" height="9" rx="2.5" fill={skin} />
      {/* tête vue de dessus : visage tourné vers la table, chevelure à l'arrière */}
      <circle cx="0" cy="0" r="6.9" fill={skin} />
      <path d="M -6.9 0.2 A 6.9 6.9 0 0 0 6.9 0.2 C 6.4 -1.8 3.6 -3.1 0 -3.1 C -3.6 -3.1 -6.4 -1.8 -6.9 0.2 Z" fill={HAIR} />
      <circle cx="-2.2" cy="-1.5" r="1.6" fill="rgba(255,255,255,0.10)" />
      {highlight && <circle cx="0" cy="0" r="9.5" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />}
    </g>
  );
};

const Table: React.FC<{ x: number; y: number; index: number; highlight?: boolean }> = ({ x, y, index, highlight }) => {
  const seats: { sx: number; sy: number; angle: number }[] = [];
  // 3 en haut, 3 en bas, 1 à gauche, 1 à droite ; l'élève regarde la table
  for (let i = 0; i < 3; i++) {
    const sx = x + TABLE_W * ((i + 0.5) / 3);
    seats.push({ sx, sy: y - 9, angle: 180 });
    seats.push({ sx, sy: y + TABLE_H + 9, angle: 0 });
  }
  seats.push({ sx: x - 9, sy: y + TABLE_H / 2, angle: 90 });
  seats.push({ sx: x + TABLE_W + 9, sy: y + TABLE_H / 2, angle: -90 });

  const cx = x + TABLE_W / 2;
  const cy = y + TABLE_H / 2;

  return (
    <g>
      {/* ombre + plateau */}
      <rect x={x + 2} y={y + 3} width={TABLE_W} height={TABLE_H} rx="7" fill="rgba(60,40,25,0.12)" />
      <rect x={x} y={y} width={TABLE_W} height={TABLE_H} rx="7" fill="#c9996a" stroke="#ad7f52" strokeWidth="1.2" />
      <rect x={x + 4} y={y + 4} width={TABLE_W - 8} height={TABLE_H - 8} rx="5" fill="none" stroke="rgba(255,255,255,0.18)" />

      {/* cahiers devant chaque élève */}
      {[0, 1, 2].map((i) => {
        const px = x + TABLE_W * ((i + 0.5) / 3);
        return (
          <g key={i}>
            <rect x={px - 7} y={y + 4} width="14" height="11" rx="1.5" fill="#fbf8f2" transform={`rotate(${(i - 1) * 6} ${px} ${y + 9})`} />
            <rect x={px - 7} y={y + TABLE_H - 15} width="14" height="11" rx="1.5" fill="#fbf8f2" transform={`rotate(${(1 - i) * 7} ${px} ${y + TABLE_H - 9})`} />
            <line x1={px - 4} y1={y + 8} x2={px + 4} y2={y + 8} stroke="#b9b1a4" strokeWidth="0.8" />
            <line x1={px - 4} y1={y + TABLE_H - 10} x2={px + 3} y2={y + TABLE_H - 10} stroke="#b9b1a4" strokeWidth="0.8" />
          </g>
        );
      })}

      {/* ardoise */}
      <rect x={cx + 13} y={cy - 9} width="22" height="16" rx="2" fill="#24302b" stroke="#6b4f36" strokeWidth="2" />
      <text x={cx + 24} y={cy + 4} textAnchor="middle" fontFamily="Caveat, cursive" fontSize="11" fill="rgba(255,255,255,0.8)">
        {['8', '45', '17', '¾', '8', '3', '12', '45', '2', '17'][index]}
      </text>

      {/* téléphone sur son support, qui parle */}
      <circle cx={cx - 8} cy={cy} r="15" fill="var(--color-accent)" opacity={highlight ? 0.22 : 0.12} />
      <circle cx={cx - 8} cy={cy} r="22" fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity={highlight ? 0.45 : 0.22} />
      <rect x={cx - 14} y={cy - 2} width="12" height="9" rx="2" fill="#6d4c31" />
      <rect x={cx - 13} y={cy - 12} width="10" height="16" rx="2.4" fill="#141311" />
      <circle cx={cx - 8} cy={cy - 6} r="2" fill="var(--color-accent)" />

      {seats.map((s, i) => (
        <Student key={i} x={s.sx} y={s.sy} angle={s.angle} seed={index * 8 + i + 1} />
      ))}
    </g>
  );
};

export const ClassroomIllustration: React.FC<{ label: string }> = ({ label }) => {
  const width = ORIGIN_X * 2 + COLS * TABLE_W + (COLS - 1) * GAP_X;
  const height = ORIGIN_Y + ROWS * TABLE_H + (ROWS - 1) * GAP_Y + 52;
  const tables: { x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      tables.push({ x: ORIGIN_X + c * (TABLE_W + GAP_X), y: ORIGIN_Y + r * (TABLE_H + GAP_Y) });
    }
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={label}>
      {/* sol */}
      <rect x="0" y="0" width={width} height={height} rx="22" fill="#efe6da" />
      <rect x="10" y="10" width={width - 20} height={height - 20} rx="16" fill="none" stroke="rgba(120,90,60,0.12)" strokeWidth="1" strokeDasharray="2 6" />

      {/* fenêtres */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x="0" y={120 + i * 90} width="8" height="54" rx="3" fill="#cfe1ea" />
      ))}

      {/* tableau */}
      <rect x={width / 2 - 170} y="22" width="340" height="30" rx="5" fill="#2e3e37" stroke="#6b4f36" strokeWidth="3" />
      <line x1={width / 2 - 140} y1="37" x2={width / 2 - 40} y2="37" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={width / 2 - 20} y1="33" x2={width / 2 + 60} y2="33" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={width / 2 - 20} y1="42" x2={width / 2 + 100} y2="42" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />

      {/* bureau de l'enseignant */}
      <rect x={width / 2 + 200} y="66" width="96" height="40" rx="5" fill="#b38557" stroke="#96693f" />
      <rect x={width / 2 + 214} y="74" width="22" height="16" rx="1.5" fill="#fbf8f2" transform={`rotate(-8 ${width / 2 + 225} 82)`} />

      {/* lignes de regard : l'enseignant suit toutes les tables */}
      {tables.map((tb, i) => (
        <line
          key={i}
          x1={width / 2}
          y1="116"
          x2={tb.x + TABLE_W / 2}
          y2={tb.y - 26}
          stroke="var(--color-accent)"
          strokeWidth="1"
          strokeDasharray="2 5"
          opacity={i < COLS ? 0.4 : 0}
        />
      ))}

      {/* l'enseignant, debout face à la classe, console en main */}
      <g transform={`translate(${width / 2} 96) scale(1.35)`}>
        <Student x={0} y={0} angle={180} seed={4} shirt="#a36b46" />
      </g>
      <rect x={width / 2 - 11} y="106" width="22" height="15" rx="2.5" fill="#141311" />
      <rect x={width / 2 - 8.5} y="108.5" width="17" height="10" rx="1.5" fill="var(--color-accent)" />

      {tables.map((tb, i) => (
        <Table key={i} x={tb.x} y={tb.y} index={i} highlight={i === 2} />
      ))}
    </svg>
  );
};
