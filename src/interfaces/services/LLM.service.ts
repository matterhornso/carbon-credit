import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LLMResult {
  content: string;
  model: string;
  finishReason: string;
  promptTokens: number;
  completionTokens: number;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class LLMServiceError extends Error {
  public readonly retryable: boolean;
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, retryable = false) {
    super(message);
    this.name = 'LLMServiceError';
    this.retryable = retryable;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LLMServiceError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Config resolution — provider-agnostic. Points at GMI Cloud today, could
// point at api.openai.com tomorrow by changing env vars only.
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = 'https://api.gmi-serving.com/v1';
const DEFAULT_MODEL = 'MiniMaxAI/MiniMax-M2.7';
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_MAX_TOKENS = 8192;

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class LLMService {
  private static readonly RETRY_USER_MSG =
    'Your previous reply was not valid JSON. Reply again with ONLY the valid JSON, no code fences, no commentary.';

  /**
   * Raw chat completion. Reads config from env lazily, at call time — never
   * at construction. Retries retryable failures (429/500/502/503/504,
   * network errors, timeouts) up to 2 more times with 2s then 5s delay.
   */
  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResult> {
    const apiKey = process.env['LLM_API_KEY'];
    if (!apiKey) {
      throw new LLMServiceError('LLM_API_KEY is not configured', undefined, false);
    }

    const baseUrl = process.env['LLM_BASE_URL'] || DEFAULT_BASE_URL;
    const model = options?.model ?? process.env['LLM_MODEL'] ?? DEFAULT_MODEL;
    const timeoutMs = options?.timeoutMs ?? envNumber('LLM_TIMEOUT_MS', DEFAULT_TIMEOUT_MS);
    const maxTokens = options?.maxTokens ?? envNumber('LLM_MAX_TOKENS', DEFAULT_MAX_TOKENS);

    const payload = {
      model,
      messages,
      temperature: options?.temperature ?? 0.2,
      max_tokens: maxTokens,
    };

    const body = JSON.stringify(payload);

    return this._requestWithRetry(baseUrl, apiKey, body, timeoutMs);
  }

  /**
   * Structured completion — parses LLM output as JSON. Retries once (with a
   * corrective follow-up message) if the response is not valid JSON.
   */
  async structuredCompletion<T>(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<T> {
    const raw = await this.chatCompletion(messages, options);
    const parsed = this._tryParseJson(raw.content);

    if (parsed !== null) {
      return parsed as T;
    }

    const retryMessages: LLMMessage[] = [
      ...messages,
      { role: 'assistant', content: raw.content },
      { role: 'user', content: LLMService.RETRY_USER_MSG },
    ];
    const retry = await this.chatCompletion(retryMessages, options);
    const retryParsed = this._tryParseJson(retry.content);

    if (retryParsed !== null) {
      return retryParsed as T;
    }

    throw new LLMServiceError('LLM did not return valid JSON', undefined, false);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async _requestWithRetry(
    baseUrl: string,
    apiKey: string,
    body: string,
    timeoutMs: number
  ): Promise<LLMResult> {
    const delays = [2000, 5000];
    let lastErr: LLMServiceError | undefined;

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        return await this._request(baseUrl, apiKey, body, timeoutMs);
      } catch (err) {
        const e =
          err instanceof LLMServiceError
            ? err
            : new LLMServiceError(String(err), undefined, true);
        lastErr = e;
        if (!e.retryable || attempt === delays.length) {
          throw e;
        }
        await this._sleep(delays[attempt]);
      }
    }

    throw lastErr ?? new LLMServiceError('request failed', undefined, true);
  }

  private _request(
    baseUrl: string,
    apiKey: string,
    body: string,
    timeoutMs: number
  ): Promise<LLMResult> {
    return new Promise<LLMResult>((resolve, reject) => {
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const url = new URL(`${normalizedBase}/chat/completions`);

      const requestOptions: http.RequestOptions | https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || undefined,
        path: url.pathname + url.search,
        method: 'POST',
        timeout: timeoutMs,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'carbon-credit-llm/1.0',
        },
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(requestOptions, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          const statusCode = res.statusCode ?? 0;
          const bodyPreview = raw.slice(0, 300);

          if (
            statusCode === 429 ||
            statusCode === 500 ||
            statusCode === 502 ||
            statusCode === 503 ||
            statusCode === 504
          ) {
            reject(
              new LLMServiceError(`LLM API error ${statusCode}: ${bodyPreview}`, statusCode, true)
            );
            return;
          }

          if (statusCode !== 200) {
            let msg = `LLM API error ${statusCode}`;
            try {
              const errBody = JSON.parse(raw) as Record<string, unknown>;
              const errObj = errBody?.error as Record<string, unknown> | undefined;
              if (errObj && typeof errObj.message === 'string') {
                msg = errObj.message;
              }
            } catch {
              // ignore parse errors on error body
            }
            reject(new LLMServiceError(`${msg} | ${bodyPreview}`, statusCode, false));
            return;
          }

          try {
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            const model = (parsed.model as string | undefined) ?? '';
            const choice = (parsed.choices as Array<Record<string, unknown>> | undefined)?.[0];
            const assistantMsg = choice?.message as Record<string, unknown> | undefined;
            let content = (assistantMsg?.content as string | undefined) ?? '';
            content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            const finishReason = (choice?.finish_reason as string | undefined) ?? 'unknown';

            const usageRaw = parsed.usage as Record<string, number> | undefined;
            const promptTokens = usageRaw?.prompt_tokens ?? 0;
            const completionTokens = usageRaw?.completion_tokens ?? 0;

            resolve({
              content,
              model,
              finishReason,
              promptTokens,
              completionTokens,
            });
          } catch (parseErr) {
            reject(
              new LLMServiceError(
                `Failed to parse LLM response: ${(parseErr as Error).message} | ${bodyPreview}`,
                statusCode,
                false
              )
            );
          }
        });
      });

      req.on('error', (err) => {
        reject(new LLMServiceError(`Request error: ${err.message}`, undefined, true));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new LLMServiceError(`Request timed out after ${timeoutMs}ms`, undefined, true));
      });

      req.write(body);
      req.end();
    });
  }

  /**
   * Parse JSON from a string that may be wrapped in a markdown code fence
   * or prefixed / suffixed with prose.
   */
  private _tryParseJson(text: string): unknown | null {
    let s = text.trim();
    let isFence = false;

    if (s.startsWith('```')) {
      const fenceEnd = s.indexOf('\n');
      if (fenceEnd !== -1) {
        s = s.slice(fenceEnd + 1);
        isFence = true;
      }
    }

    if (isFence) {
      const lastBacktick = s.lastIndexOf('```');
      if (lastBacktick !== -1) {
        s = s.slice(0, lastBacktick);
      }
    }

    s = s.trim();

    try {
      return JSON.parse(s) as unknown;
    } catch {
      // fall through to heuristic extraction
    }

    const firstOpen = s.indexOf('{');
    const firstArr = s.indexOf('[');
    const start =
      firstOpen === -1 ? firstArr : firstArr === -1 ? firstOpen : Math.min(firstOpen, firstArr);

    if (start === -1) {
      return null;
    }

    const endChar = s[start] === '{' ? '}' : ']';
    let depth = 0;
    let end = -1;

    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (ch === '{' || ch === '[') {
        depth++;
      } else if (ch === '}' || ch === ']') {
        depth--;
        if (ch === endChar && depth === 0) {
          end = i;
          break;
        }
      }
    }

    if (end === -1) {
      return null;
    }

    const candidate = s.slice(start, end + 1).trim();
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      return null;
    }
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }
}
