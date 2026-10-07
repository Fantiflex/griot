import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const here = path.dirname(fileURLToPath(import.meta.url));
/** Racine du dépôt : un cran au-dessus de server/ (tsx) comme de dist/ (bundle). */
export const ROOT_DIR = path.resolve(here, '..');

function env(name: string, fallback: string): string {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

export const config = {
  port: Number(env('PORT', '3000')),
  isProd: process.env.NODE_ENV === 'production',
  dataDir: path.resolve(ROOT_DIR, env('DATA_DIR', 'data')),

  /** Serveur de modèle compatible OpenAI : Ollama en dev, vLLM sur GPU. */
  llm: {
    baseUrl: env('LLM_BASE_URL', 'http://localhost:11434/v1').replace(/\/$/, ''),
    apiKey: env('LLM_API_KEY', 'ollama'),
    model: env('LLM_MODEL', 'gemma3:4b'),
    /** Modèle utilisé pour lire les images. Même modèle par défaut (Gemma 3 est multimodal). */
    visionModel: env('LLM_VISION_MODEL', env('LLM_MODEL', 'gemma3:4b')),
    timeoutMs: Number(env('LLM_TIMEOUT_MS', '90000')),
    temperature: Number(env('LLM_TEMPERATURE', '0.6')),
  },

  /** Lecture du manuscrit. */
  mathpix: {
    appId: env('MATHPIX_APP_ID', ''),
    appKey: env('MATHPIX_APP_KEY', ''),
  },

  /** Sidecar de synthèse vocale (services/tts). Vide = voix du navigateur uniquement. */
  tts: {
    url: env('TTS_URL', 'http://localhost:5002').replace(/\/$/, ''),
    enabled: env('TTS_ENABLED', 'true') !== 'false',
  },

  /** HTTPS optionnel pour que la caméra fonctionne depuis un téléphone sur le réseau local. */
  ssl: {
    cert: env('SSL_CERT', ''),
    key: env('SSL_KEY', ''),
  },

  /** Seuils de pédagogie. */
  lesson: {
    maxAttempts: 3,
    inactivityAlertMs: 6 * 60 * 1000,
    transcriptWindow: 40,
  },
};

export function describeConfig(): string {
  return [
    `LLM        ${config.llm.baseUrl} (${config.llm.model}, vision: ${config.llm.visionModel})`,
    `TTS        ${config.tts.enabled ? config.tts.url : 'désactivée'}`,
    `Mathpix    ${config.mathpix.appId ? 'clé présente' : 'absent (vision LLM seule)'}`,
    `Données    ${config.dataDir}`,
    `HTTPS      ${config.ssl.cert ? 'oui' : 'non'}`,
  ].join('\n');
}
