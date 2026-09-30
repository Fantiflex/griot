import React from 'react';

/**
 * Authentic Ndop and Toghu geometric motifs from the Cameroon Grassfields.
 * Features:
 * - The sacred chevron zig-zag ("Lom")
 * - The leopard eye diamond rhombus with cross ("Nwi-Ndop")
 * - Orthogonal parallel and perpendicular woven grids
 */
export const NdopMotifWatermark: React.FC<{ className?: string; opacity?: number }> = ({
  className = '',
  opacity = 0.08,
}) => {
  return (
    <svg
      className={`select-none pointer-events-none ${className}`}
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="ndopGrid" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* Diamond Rhombus */}
          <polygon points="30,5 55,30 30,55 5,30" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <polygon points="30,15 45,30 30,45 15,30" stroke="currentColor" strokeWidth="1" fill="none" />
          {/* Diagonal Cross */}
          <line x1="5" y1="5" x2="55" y2="55" stroke="currentColor" strokeWidth="0.8" />
          <line x1="55" y1="5" x2="5" y2="55" stroke="currentColor" strokeWidth="0.8" />
          {/* Concentric Center */}
          <circle cx="30" cy="30" r="2.5" fill="currentColor" />
          {/* Orthogonal Accents */}
          <line x1="30" y1="0" x2="30" y2="5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="30" y1="55" x2="30" y2="60" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="30" x2="5" y2="30" stroke="currentColor" strokeWidth="1.5" />
          <line x1="55" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="400" height="120" fill="url(#ndopGrid)" />
    </svg>
  );
};

export const NdopBadgeMotif: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" strokeWidth="2" fill="none" />
      <polygon points="12,6 18,12 12,18 6,12" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1" />
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
};
