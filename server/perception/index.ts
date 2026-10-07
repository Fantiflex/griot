import { config } from '../config';
import { chatJson, imagePart, LlmUnavailableError, type ChatMessage } from '../llm/provider';
import { visionReadMessages } from '../griot/prompts';
import type { Lang, SlateReading } from '../../shared/types';

/**
 * Lecture de l'ardoise photographiée par le téléphone.
 *  1. Mathpix si une clé est configurée (manuscrit, maths et texte).
 *  2. Sinon, ou en cas d'échec, le modèle de vision auto-hébergé (Gemma 3).
 * Les deux renvoient le même type SlateReading.
 */

export interface ReadOptions {
  lang: Lang;
  /** Indice sur le contenu attendu, utile au modèle de vision pour les chiffres ambigus. */
  expectedHint?: string;
}

interface MathpixResponse {
  text?: string;
  latex_styled?: string;
  confidence?: number;
  confidence_rate?: number;
  is_handwritten?: boolean;
  error?: string;
}

export function mathpixEnabled(): boolean {
  return Boolean(config.mathpix.appId && config.mathpix.appKey);
}

async function readWithMathpix(dataUrl: string): Promise<SlateReading> {
  const res = await fetch('https://api.mathpix.com/v3/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      app_id: config.mathpix.appId,
      app_key: config.mathpix.appKey,
    },
    body: JSON.stringify({
      src: dataUrl,
      formats: ['text', 'latex_styled'],
      include_line_data: false,
      rm_spaces: false,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Mathpix HTTP ${res.status}`);
  const data = (await res.json()) as MathpixResponse;
  if (data.error) throw new Error(`Mathpix: ${data.error}`);
  return {
    text: (data.text ?? '').trim(),
    latex: data.latex_styled,
    confidence: data.confidence ?? data.confidence_rate ?? 0.5,
    provider: 'mathpix',
    at: Date.now(),
  };
}

async function readWithVisionLlm(dataUrl: string, opts: ReadOptions): Promise<SlateReading> {
  const base = visionReadMessages(opts.lang, opts.expectedHint);
  const last = base[base.length - 1];
  const messages: ChatMessage[] = [
    ...base.slice(0, -1),
    {
      role: 'user',
      content: [{ type: 'text', text: typeof last.content === 'string' ? last.content : '' }, imagePart(dataUrl)],
    },
  ];
  const parsed = await chatJson<{ text?: string; confidence?: number; empty?: boolean }>(messages, {
    model: config.llm.visionModel,
    temperature: 0.1,
    maxTokens: 200,
  });
  const text = parsed?.empty ? '' : (parsed?.text ?? '').trim();
  return {
    text,
    confidence: typeof parsed?.confidence === 'number' ? parsed.confidence : text ? 0.5 : 0,
    provider: 'vision-llm',
    at: Date.now(),
  };
}

export async function readSlate(dataUrl: string, opts: ReadOptions): Promise<SlateReading> {
  if (!dataUrl.startsWith('data:image/')) {
    throw new Error('Image attendue au format data URL');
  }
  if (mathpixEnabled()) {
    try {
      return await readWithMathpix(dataUrl);
    } catch (err) {
      console.warn('[perception] Mathpix a échoué, repli sur la vision LLM :', (err as Error).message);
    }
  }
  try {
    return await readWithVisionLlm(dataUrl, opts);
  } catch (err) {
    if (err instanceof LlmUnavailableError) {
      return { text: '', confidence: 0, provider: 'none', at: Date.now() };
    }
    throw err;
  }
}
