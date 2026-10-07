import { config } from '../config';
import { extractJson } from '../util';

/**
 * Client pour tout serveur de modèle compatible OpenAI :
 *  - Ollama en développement (http://localhost:11434/v1)
 *  - vLLM / llama.cpp / TGI sur un GPU loué ou sur le serveur de l'établissement
 * Le modèle fine-tuné LeGriot se branche ici sans toucher au reste du code.
 */

export type ChatRole = 'system' | 'user' | 'assistant';

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface ChatMessage {
  role: ChatRole;
  content: string | ContentPart[];
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  model?: string;
  timeoutMs?: number;
}

export class LlmUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LlmUnavailableError';
  }
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string };
}

export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? config.llm.timeoutMs);
  try {
    const body: Record<string, unknown> = {
      model: opts.model ?? config.llm.model,
      messages,
      temperature: opts.temperature ?? config.llm.temperature,
      max_tokens: opts.maxTokens ?? 400,
      stream: false,
    };
    if (opts.json) body.response_format = { type: 'json_object' };

    const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.llm.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new LlmUnavailableError(`LLM HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new LlmUnavailableError(data.error?.message ?? 'Réponse vide du modèle');
    }
    return content.trim();
  } catch (err) {
    if (err instanceof LlmUnavailableError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new LlmUnavailableError(`Modèle injoignable (${config.llm.baseUrl}): ${msg}`);
  } finally {
    clearTimeout(timer);
  }
}

/** Appel attendant un objet JSON ; une relance sans mode JSON si le serveur ne le supporte pas. */
export async function chatJson<T>(messages: ChatMessage[], opts: ChatOptions = {}): Promise<T | null> {
  let raw: string;
  try {
    raw = await chat(messages, { ...opts, json: true });
  } catch (err) {
    if (err instanceof LlmUnavailableError && /response_format|json_object/i.test(err.message)) {
      raw = await chat(messages, { ...opts, json: false });
    } else {
      throw err;
    }
  }
  return extractJson<T>(raw);
}

export function imagePart(dataUrl: string): ContentPart {
  return { type: 'image_url', image_url: { url: dataUrl } };
}

export async function checkLlmHealth(): Promise<{ reachable: boolean; error?: string }> {
  try {
    const res = await fetch(`${config.llm.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${config.llm.apiKey}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return { reachable: false, error: `HTTP ${res.status}` };
    const data = (await res.json().catch(() => ({}))) as { data?: { id: string }[] };
    const ids = (data.data ?? []).map((m) => m.id);
    if (ids.length && !ids.some((id) => id === config.llm.model || id.startsWith(config.llm.model))) {
      return { reachable: true, error: `Modèle « ${config.llm.model} » absent. Disponibles : ${ids.join(', ')}` };
    }
    return { reachable: true };
  } catch (err) {
    return { reachable: false, error: err instanceof Error ? err.message : String(err) };
  }
}
