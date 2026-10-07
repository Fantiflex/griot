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

/** Visage du Griot avec quelques états : parle, écoute, réfléchit, regarde l'ardoise. */
export const GriotAvatar: React.FC<{ pose: GriotPose; speaking: boolean; size?: number; className?: string }> = ({
  pose,
  speaking,
  size = 112,
  className = '',
}) => {
  const ring = speaking ? 'ring-4 ring-[#A36B46] shadow-[0_0_0_8px_rgba(163,107,70,0.18)]' : 'ring-2 ring-stone-300';
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src={IMAGES[pose]}
        alt=""
        draggable={false}
        className={`w-full h-full object-cover rounded-full transition-all duration-300 ${ring} ${pose === 'looking' ? 'rotate-6' : ''}`}
      />
      {speaking && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-4 bg-white/90 px-2 py-1 rounded-full shadow">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-0.5 bg-[#A36B46] rounded-full animate-pulse"
              style={{ height: `${6 + ((i * 3) % 7)}px`, animationDelay: `${i * 120}ms`, animationDuration: '700ms' }}
            />
          ))}
        </span>
      )}
      {pose === 'looking' && (
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center shadow">👁</span>
      )}
    </div>
  );
};
