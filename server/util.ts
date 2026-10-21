import { randomBytes } from 'crypto';
export { normalizeAnswer, levenshtein } from '../shared/judge';

export function newId(prefix = ''): string {
  return prefix + randomBytes(6).toString('base64url');
}

/** Code de classe à 6 caractères sans lettres ambiguës, facile à dicter. */
export function newClassCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}


/** Extrait le premier objet JSON d'une réponse de modèle, même entourée de texte ou de ```json. */
export function extractJson<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}


export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
