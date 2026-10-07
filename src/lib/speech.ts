import type { Lang } from '@shared/types';
import { api } from './api';

/**
 * Voix du Griot côté client.
 *  1. Voix serveur (Piper, fine-tunable) via /api/tts, lue avec un <audio>.
 *  2. Sinon, synthèse du navigateur dans la langue de la classe.
 * File d'attente : les paroles se suivent sans se couper.
 */

type QueueItem = { text: string; lang: Lang; onStart?: () => void; onEnd?: () => void };

const BROWSER_LOCALE: Record<Lang, string[]> = {
  fr: ['fr-CM', 'fr-SN', 'fr-CI', 'fr-FR', 'fr-CA', 'fr'],
  sw: ['sw-KE', 'sw-TZ', 'sw'],
};

let queue: QueueItem[] = [];
let playing = false;
let muted = false;
let serverTtsAvailable: boolean | null = null;
let currentAudio: HTMLAudioElement | null = null;
let unlocked = false;

export function setMuted(value: boolean) {
  muted = value;
  if (muted) stopAll();
}
export function isMuted() {
  return muted;
}

/** À appeler lors d'un geste utilisateur : débloque l'audio sur mobile. */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  try {
    const a = new Audio();
    a.muted = true;
    void a.play().catch(() => {});
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch {
    /* ignoré */
  }
}

export function stopAll() {
  queue = [];
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  playing = false;
}

export function speak(text: string, lang: Lang, callbacks: { onStart?: () => void; onEnd?: () => void } = {}) {
  const clean = text.replace(/[*_~`#]/g, '').trim();
  if (!clean) return;
  queue.push({ text: clean, lang, ...callbacks });
  if (!playing) void drain();
}

async function drain() {
  playing = true;
  while (queue.length) {
    const item = queue.shift()!;
    if (muted) {
      item.onStart?.();
      item.onEnd?.();
      continue;
    }
    item.onStart?.();
    try {
      const ok = await playServer(item);
      if (!ok) await playBrowser(item);
    } catch {
      /* on passe à la suite */
    }
    item.onEnd?.();
  }
  playing = false;
}

async function playServer(item: QueueItem): Promise<boolean> {
  if (serverTtsAvailable === false) return false;
  const blob = await api.tts(item.text, item.lang);
  if (!blob) {
    serverTtsAvailable = false;
    // On retente plus tard : le sidecar peut démarrer après le serveur.
    setTimeout(() => (serverTtsAvailable = null), 60_000);
    return false;
  }
  serverTtsAvailable = true;
  const url = URL.createObjectURL(blob);
  await new Promise<void>((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
  URL.revokeObjectURL(url);
  currentAudio = null;
  return true;
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  for (const loc of BROWSER_LOCALE[lang]) {
    const v = voices.find((x) => x.lang.toLowerCase().replace('_', '-').startsWith(loc.toLowerCase()));
    if (v) return v;
  }
  return null;
}

function playBrowser(item: QueueItem): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(item.text);
    u.lang = BROWSER_LOCALE[item.lang][0];
    const voice = pickVoice(item.lang);
    if (voice) u.voice = voice;
    u.rate = 0.92;
    u.pitch = 0.95;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
    // Garde-fou : certains navigateurs n'émettent jamais onend.
    setTimeout(resolve, Math.min(25_000, 400 + item.text.length * 60));
  });
}

export function hasServerVoice(): boolean | null {
  return serverTtsAvailable;
}

/** Nombre de paroles encore en attente (hors celle en cours). */
export function queueLength(): number {
  return queue.length;
}
