import React from 'react';
import { Check, LayoutDashboard, Server, Smartphone } from 'lucide-react';
import type { SiteCopy } from '@site/copy';

/**
 * Où tourne LeGriot : les téléphones des tables, le serveur de l'école, la console enseignant,
 * reliés par le Wi-Fi local. Construit en HTML pour rester lisible et responsive.
 */
export const ArchitectureDiagram: React.FC<{ arch: SiteCopy['tech']['arch'] }> = ({ arch }) => {
  const blocks = [
    { key: 'table', icon: Smartphone, data: arch.table, dark: false, badge: '× 10' },
    { key: 'server', icon: Server, data: arch.server, dark: true, badge: '' },
    { key: 'teacher', icon: LayoutDashboard, data: arch.teacher, dark: false, badge: '' },
  ];
  return (
    <figure className="rounded-3xl bg-surface border border-line p-6 sm:p-10">
      <div className="grid lg:grid-cols-[1fr_auto_1.15fr_auto_1fr] items-stretch gap-4 lg:gap-0">
        {blocks.map((b, i) => (
          <React.Fragment key={b.key}>
            <div className={`rounded-2xl p-6 ${b.dark ? 'bg-ink text-white shadow-[0_24px_50px_-24px_rgba(20,19,17,0.55)]' : 'bg-bg border border-line'}`}>
              <div className="flex items-center justify-between">
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${b.dark ? 'bg-white/10' : 'bg-ink'}`}>
                  <b.icon className="w-5 h-5 text-accent" />
                </span>
                {b.badge && <span className="font-mono text-xs text-muted">{b.badge}</span>}
              </div>
              <div className="mt-5 font-display font-semibold text-xl">{b.data.title}</div>
              <div className={`text-xs mt-0.5 ${b.dark ? 'text-white/55' : 'text-muted'}`}>{b.data.sub}</div>
              <ul className={`mt-5 space-y-2 text-sm ${b.dark ? 'text-white/85' : 'text-ink-2'}`}>
                {b.data.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            {i < blocks.length - 1 && <Connector label={arch.link} />}
          </React.Fragment>
        ))}
      </div>
      <figcaption className="mt-6 flex items-start gap-2 text-sm text-ink-2">
        <span className="mt-1.5 w-2 h-2 rotate-45 bg-green shrink-0" />
        {arch.note}
      </figcaption>
    </figure>
  );
};

/** Liaison entre deux blocs : horizontale sur grand écran, verticale sur mobile. */
const Connector: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex lg:flex-col items-center justify-center gap-2 py-1 lg:py-0 lg:px-3" aria-hidden="true">
    <span className="lg:hidden w-px h-6 bg-line-2" />
    <svg viewBox="0 0 64 16" className="hidden lg:block w-14 h-4 text-accent">
      <line x1="2" y1="8" x2="62" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
      <path d="M2 8 l6 -4 v8 z M62 8 l-6 -4 v8 z" fill="currentColor" />
    </svg>
    <span className="font-mono text-[10px] uppercase tracking-wider text-muted whitespace-nowrap">{label}</span>
    <span className="lg:hidden w-px h-6 bg-line-2" />
  </div>
);
