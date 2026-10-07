import React from 'react';

/**
 * Marque LeGriot : un cercle (la table, le cercle des élèves) et un point décalé (le Griot qui parle).
 * Monochrome, lisible à 16 px comme à 200 px. La couleur suit `currentColor`, l'accent est optionnel.
 */
export const LogoMark: React.FC<{ size?: number; className?: string; accent?: string }> = ({ size = 28, className = '', accent }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="21" cy="11" r="4" fill={accent ?? 'currentColor'} />
  </svg>
);

export const Logo: React.FC<{ size?: number; className?: string; wordmark?: boolean; accent?: string }> = ({ size = 28, className = '', wordmark = true, accent }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} accent={accent} />
    {wordmark && <span className="font-semibold tracking-tight" style={{ fontSize: size * 0.72 }}>LeGriot</span>}
  </span>
);
