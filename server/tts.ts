import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import type { Lang } from '../shared/types';

/**
 * Synthèse vocale : proxy vers le sidecar Piper (services/tts), avec cache disque.
 * Si le sidecar est absent, le client bascule sur la voix du navigateur.
 */

const cacheDir = path.join(config.dataDir, 'tts-cache');
fs.mkdirSync(cacheDir, { recursive: true });

function cacheKey(text: string, lang: Lang): string {
  return createHash('sha1').update(`${lang}\n${text}`).digest('hex');
}

export async function synthesize(text: string, lang: Lang): Promise<Buffer | null> {
  if (!config.tts.enabled) return null;
  const file = path.join(cacheDir, `${cacheKey(text, lang)}.wav`);
  if (fs.existsSync(file)) return fs.readFileSync(file);

  try {
    const res = await fetch(`${config.tts.url}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return null;
    fs.writeFile(file, buf, () => {});
    return buf;
  } catch {
    return null;
  }
}

export async function checkTtsHealth(): Promise<boolean> {
  if (!config.tts.enabled) return false;
  try {
    const res = await fetch(`${config.tts.url}/health`, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
}
