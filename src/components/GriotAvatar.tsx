import React from 'react';
import type { GriotPose } from '@shared/types';

const IMAGES: Record<GriotPose, string> = {
  welcoming: '/assets/griot_welcoming_1790538588341.jpg',
  storytelling: '/assets/griot_storytelling_1790538617475.jpg',
  thinking: '/assets/griot_thinking_1790538626975.jpg',
  thumbsUp: '/assets/griot_thumbsup_1790538635781.jpg',
  celebrating: '/assets/griot_celebrating_1790538644481.jpg',
  listening: '/assets/griot_welcoming_1790538588341.jpg',
  looking: '/assets/griot_thinking_1790538626975.jpg',
};

/** Visage du Griot. Un anneau accent fin quand il parle, rien d'autre. */
export const GriotAvatar: React.FC<{ pose: GriotPose; speaking: boolean; size?: number; className?: string }> = ({
  pose,
  speaking,
  size = 96,
  className = '',
}) => (
  <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
    <img
      src={IMAGES[pose]}
      alt=""
      draggable={false}
      className="w-full h-full object-cover rounded-full transition-all duration-300"
      style={{ boxShadow: speaking ? '0 0 0 2px var(--color-night), 0 0 0 4px var(--color-accent)' : '0 0 0 1px rgba(255,255,255,0.15)' }}
    />
    {speaking && (
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-3 px-2 py-1 rounded-full bg-accent">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: `${5 + (i % 2) * 4}px`, animationDelay: `${i * 140}ms`, animationDuration: '700ms' }} />
        ))}
      </span>
    )}
  </div>
);
