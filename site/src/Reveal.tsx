import React, { useEffect, useRef, useState } from 'react';

/**
 * Fait apparaître son contenu en douceur quand il entre à l'écran (une seule fois).
 * Sûr par défaut : le contenu n'est masqué que s'il est sous la ligne de flottaison au montage,
 * et il s'affiche de toute façon après un court délai si l'observateur ne se déclenche pas.
 */
export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number; as?: 'div' | 'li' }> = ({
  children,
  className = '',
  delay = 0,
  as = 'div',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<'static' | 'hidden' | 'shown'>('static');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const belowFold = el.getBoundingClientRect().top > window.innerHeight * 0.92;
    if (!belowFold) return; // déjà visible : pas d'animation, pas de risque
    setState('hidden');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('shown');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as 'div';
  const cls = state === 'static' ? '' : `reveal ${state === 'shown' ? 'is-in' : ''}`;
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={`${cls} ${className}`} style={delay && state !== 'static' ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
};
