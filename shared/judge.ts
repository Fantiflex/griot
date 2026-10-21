import { t, type ExerciseStep, type Lang } from './types';

/**
 * Juge déterministe des réponses fermées, sans IA.
 * Partagé par le serveur (moteur de leçon) et par la démo du site (navigateur) :
 * aucune dépendance Node ici.
 */

/** Normalisation pour comparaison tolérante de réponses manuscrites. */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`´]/g, "'")
    .replace(/[^a-z0-9,.\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Distance de Levenshtein, pour tolérer une faute dans une dictée. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * Vrai ou faux pour une réponse fermée ; null pour une question ouverte
 * (seul le modèle peut alors juger).
 */
export function deterministicJudge(step: ExerciseStep, reading: string, lang: Lang): boolean | null {
  const candidates = [...(step.accept ?? []), step.expected ? t(step.expected, lang) : '', step.expected?.fr ?? '']
    .filter(Boolean)
    .map(normalizeAnswer);
  if (!candidates.length) return null;
  const got = normalizeAnswer(reading);
  if (!got) return false;
  const gotTokens = got.split(' ');
  for (const c of candidates) {
    if (got === c || got.includes(c)) return true;
    const cTokens = c.split(' ');
    if (cTokens.length === 1) {
      if (gotTokens.some((tok) => tok === c || (c.length >= 4 && levenshtein(tok, c) <= 1))) return true;
    } else if (levenshtein(got, c) <= Math.max(1, Math.floor(c.length / 8))) {
      return true;
    }
  }
  // Pour les listes (ex. deux marchandises), compter les correspondances distinctes.
  if (step.accept && step.accept.length >= 4) {
    const hits = new Set(
      step.accept.map(normalizeAnswer).filter((a) => gotTokens.some((tok) => tok === a || (a.length >= 4 && levenshtein(tok, a) <= 1))),
    );
    if (hits.size >= 2) return true;
  }
  return false;
}
