import React from 'react';
import type { SiteLang } from '@site/copy';

/**
 * Visuel produit du haut de page, construit en HTML/CSS (net à toutes les tailles) :
 * le téléphone du groupe sur son support, une ardoise, et la vue enseignant en surimpression.
 */

const T = {
  en: {
    step: 'Math · Step 2 of 5',
    bubble: 'Not yet. Group your pebbles in piles of three. How many piles do you get?',
    slate: 'Slate',
    read: 'I read “6”',
    done: 'We’re done',
    hint: 'A hint',
    call: 'Call the teacher',
    teacher: 'Teacher view',
    live: 'Live',
    groups: [
      { name: 'Lion 1', state: 'Stuck after 2 tries', tone: 'warn' },
      { name: 'Baobab 2', state: 'Writing on the slate', tone: 'muted' },
      { name: 'River 3', state: 'Step 4 of 5 · 3 correct', tone: 'ok' },
    ],
    alert: 'Lion 1 needs you',
  },
  fr: {
    step: 'Maths · Étape 2 sur 5',
    bubble: 'Pas encore. Groupez vos cailloux par trois. Combien de tas obtenez-vous ?',
    slate: 'Ardoise',
    read: 'J’ai lu « 6 »',
    done: 'On a fini',
    hint: 'Un indice',
    call: 'Appeler l’enseignant',
    teacher: 'Vue enseignant',
    live: 'En direct',
    groups: [
      { name: 'Lion 1', state: 'Bloqué après 2 essais', tone: 'warn' },
      { name: 'Baobab 2', state: 'Écrit sur l’ardoise', tone: 'muted' },
      { name: 'Fleuve 3', state: 'Étape 4 sur 5 · 3 réussites', tone: 'ok' },
    ],
    alert: 'Lion 1 a besoin de vous',
  },
} as const;

export const HeroVisual: React.FC<{ lang: SiteLang }> = ({ lang }) => {
  const t = T[lang];
  return (
    <div className="relative mx-auto w-full max-w-[520px] aspect-[5/5.4]" aria-hidden="true">
      {/* halo */}
      <div className="absolute inset-[8%] rounded-full bg-accent/15 blur-3xl" />

      {/* ardoise posée sur la table */}
      <div className="absolute left-[2%] bottom-[6%] w-[42%] rotate-[-8deg] rounded-xl border-[6px] border-[#7a5a3e] slate shadow-[0_18px_40px_-18px_rgba(20,19,17,0.55)] aspect-[4/3] flex flex-col items-center justify-center">
        <span className="font-chalk text-white/85 text-5xl leading-none">6</span>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/35">{t.slate}</span>
      </div>

      {/* support en bois + téléphone */}
      <div className="absolute left-[30%] top-[4%] w-[40%]">
        <div className="relative rounded-[26px] bg-night p-[6px] shadow-[0_30px_60px_-24px_rgba(20,19,17,0.6)]">
          <div className="rounded-[21px] bg-night-2 overflow-hidden aspect-[9/15.5] flex flex-col">
            <div className="h-5 flex items-center justify-center">
              <span className="w-10 h-1.5 rounded-full bg-white/10" />
            </div>
            <div className="px-3 pt-2 flex items-center gap-2">
              <svg viewBox="0 0 48 48" className="w-7 h-7 shrink-0">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3" />
                <circle cx="32" cy="16" r="7" fill="var(--color-accent)" />
              </svg>
              <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/45 leading-tight">{t.step}</span>
            </div>
            <div className="mx-3 mt-2.5 rounded-xl rounded-tl-sm bg-white text-ink p-2.5 text-[10.5px] leading-snug">{t.bubble}</div>
            <div className="mx-3 mt-2.5 rounded-lg slate border-[3px] border-[#6b4f36] h-14 flex items-center justify-center">
              <span className="font-chalk text-white/80 text-3xl">6</span>
            </div>
            <div className="mt-3 mx-3 rounded-lg bg-accent text-white text-[10px] font-medium py-2 text-center">{t.done}</div>
            <div className="mt-auto mx-3 mb-3 grid grid-cols-2 gap-1.5 pt-3 border-t border-white/10">
              <span className="rounded-md border border-white/15 text-white/70 text-[9px] py-1.5 text-center">{t.hint}</span>
              <span className="rounded-md border border-white/15 text-white/70 text-[9px] py-1.5 text-center">{t.call}</span>
            </div>
          </div>
        </div>
        {/* pied du support */}
        <div className="mx-auto w-[34%] h-7 bg-gradient-to-b from-[#8a6342] to-[#6d4c31] rounded-b-md" />
        <div className="mx-auto w-[78%] h-3 bg-[#5d402a] rounded-full shadow-[0_10px_20px_-8px_rgba(20,19,17,0.6)]" />
      </div>

      {/* bulle « j'ai lu » */}
      <div className="absolute left-[4%] top-[34%] rounded-full bg-surface border border-line shadow-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 animate-float">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {t.read}
      </div>

      {/* vue enseignant */}
      <div className="absolute right-0 -bottom-[3%] w-[56%] rounded-2xl bg-surface border border-line shadow-[0_24px_50px_-20px_rgba(20,19,17,0.35)] p-3.5 animate-float-slow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold">{t.teacher}</span>
          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-green bg-green-soft rounded-full px-1.5 py-0.5">
            <span className="w-1 h-1 rounded-full bg-green" /> {t.live}
          </span>
        </div>
        <ul className="mt-2.5 space-y-1.5">
          {t.groups.map((g) => (
            <li key={g.name} className={`flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 ${g.tone === 'warn' ? 'border-amber/40 bg-amber-soft' : 'border-line'}`}>
              <span className="text-[10px] font-medium">{g.name}</span>
              <span className={`text-[9px] truncate ${g.tone === 'warn' ? 'text-amber font-medium' : g.tone === 'ok' ? 'text-green' : 'text-muted'}`}>{g.state}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-ink text-white text-[10px] px-2 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber" /> {t.alert}
        </div>
      </div>
    </div>
  );
};
