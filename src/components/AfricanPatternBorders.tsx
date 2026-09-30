import React from 'react';

export const AfricanPatternBorders: React.FC<{ className?: string; variant?: 'full' | 'divider' | 'stripes' }> = ({
  className = '',
  variant = 'full',
}) => {
  return (
    <div className={`w-full overflow-hidden select-none ${className}`} aria-hidden="true">
      <svg
        className="w-full h-8"
        viewBox="0 0 1200 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Band 1: Deep Indigo Background */}
        <rect width="1200" height="32" fill="#18202F" />

        {/* Orthogonal lines pattern (Droites parallèles et perpendiculaires du Ndop) */}
        <g stroke="#EFE6CF" strokeWidth="2" strokeLinecap="round" opacity="0.9">
          {Array.from({ length: 40 }).map((_, i) => (
            <g key={`ortho-${i}`} transform={`translate(${i * 30}, 0)`}>
              {i % 2 === 0 ? (
                <>
                  <line x1="4" y1="8" x2="4" y2="24" />
                  <line x1="10" y1="8" x2="10" y2="24" />
                  <line x1="16" y1="8" x2="16" y2="24" />
                </>
              ) : (
                <>
                  <line x1="2" y1="10" x2="18" y2="10" />
                  <line x1="2" y1="16" x2="18" y2="16" />
                  <line x1="2" y1="22" x2="18" y2="22" />
                </>
              )}
            </g>
          ))}
        </g>

        {/* Zigzag wave overlay (Ondes de la terre) */}
        <path
          d="M0,16 L12,4 L24,28 L36,4 L48,28 L60,4 L72,28 L84,4 L96,28 L108,4 L120,28 L132,4 L144,28 L156,4 L168,28 L180,4 L192,28 L204,4 L216,28 L228,4 L240,28 L252,4 L264,28 L276,4 L288,28 L300,4 L312,28 L324,4 L336,28 L348,4 L360,28 L372,4 L384,28 L396,4 L408,28 L420,4 L432,28 L444,4 L456,28 L468,4 L480,28 L492,4 L504,28 L516,4 L528,28 L540,4 L552,28 L564,4 L576,28 L588,4 L600,28 L612,4 L624,28 L636,4 L648,28 L660,4 L672,28 L684,4 L696,28 L708,4 L720,28 L732,4 L744,28 L756,4 L768,28 L780,4 L792,28 L804,4 L816,28 L828,4 L840,28 L852,4 L864,28 L876,4 L888,28 L900,4 L912,28 L924,4 L936,28 L948,4 L960,28 L972,4 L984,28 L996,4 L1008,28 L1020,4 L1032,28 L1044,4 L1056,28 L1068,4 L1080,28 L1092,4 L1104,28 L1116,4 L1128,28 L1140,4 L1152,28 L1164,4 L1176,28 L1188,4 L1200,28"
          stroke="#A36B46"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />

        {/* Losanges reliés (Les yeux des ancêtres) */}
        <g stroke="#EFE6CF" strokeWidth="1.5" fill="none" opacity="0.8">
          {Array.from({ length: 25 }).map((_, i) => (
            <g key={`diamond-${i}`} transform={`translate(${i * 48 + 12}, 16)`}>
              <polygon points="0,-8 8,0 0,8 -8,0" />
              <line x1="-12" y1="-8" x2="12" y2="8" stroke="#A36B46" strokeWidth="1" />
              <line x1="-12" y1="8" x2="12" y2="-8" stroke="#A36B46" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="#EFE6CF" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};
