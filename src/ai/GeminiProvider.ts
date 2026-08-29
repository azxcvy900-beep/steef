// ============================================================
// Gemini AI Provider Implementation
// ============================================================

import type {
  AIProvider,
  AIMessage,
  AIOptions,
  AIResponse,
} from './AIProviderInterface';

/**
 * Google Gemini provider implementation.
 * Uses the Gemini REST API directly to avoid SDK lock-in.
 *
 * Phase 1: Basic implementation with fetch.
 * Phase 4+: Add streaming, function calling, caching.
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'google-gemini';
  readonly defaultModel = 'gemini-3.7-flash';
  readonly cheapModel = 'gemini-3.5-flash-lite';
  readonly powerfulModel = 'gemini-3.7-flash'; // Fallback for powerful

  private readonly apiKey: string;
  private readonly baseUrl =
    'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('[GeminiProvider] API key is required.');
    this.apiKey = apiKey;
  }

  async chat(messages: AIMessage[], options: AIOptions = {}): Promise<AIResponse> {
    const model = options.model ?? this.defaultModel;

    // Build Gemini contents format
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // System instruction from options or system messages
    const systemMessage = messages.find((m) => m.role === 'system');
    const systemInstruction = options.systemPrompt ?? systemMessage?.content;

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const url = `${this.baseUrl}/${model}:generateContent?key=***REDACTED***`;
    const actualUrl = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
    
    console.log(`[GeminiProvider] Calling Gemini API URL: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    let res: Response;
    const startTime = Date.now();

    try {
      res = await fetch(actualUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[GeminiProvider] TIMEOUT_ERROR: Request to ${model} aborted after ${elapsed}ms`);
        throw new Error(`[GeminiProvider] TIMEOUT_ERROR`);
      }
      console.error(`[GeminiProvider] NETWORK_ERROR: ${error instanceof Error ? error.message : 'Unknown'} (Elapsed: ${elapsed}ms)`);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    const elapsed = Date.now() - startTime;
    console.log(`[GeminiProvider] HTTP Status: ${res.status} ${res.statusText} (Model: ${model}, Time: ${elapsed}ms)`);

    if (!res.ok) {
      // Consume the body so it doesn't leak memory, but don't expose it in the thrown error
      await res.text().catch(() => ''); 
      
      let errorType = 'API_ERROR';
      if (res.status === 503) errorType = 'SERVICE_UNAVAILABLE';
      if (res.status === 429) errorType = 'RATE_LIMIT_EXCEEDED';
      if (res.status === 400) errorType = 'BAD_REQUEST';
      if (res.status === 403) errorType = 'PERMISSION_DENIED';
      if (res.status === 404) errorType = 'MODEL_NOT_FOUND';

      console.error(`[GeminiProvider] ${errorType}: HTTP ${res.status} (Model: ${model}, Time: ${elapsed}ms)`);
      throw new Error(`[GeminiProvider] ${errorType} ${res.status}`);
    }

    const data = await res.json();
    console.log(`[GeminiProvider] Response parsed successfully (Time: ${elapsed}ms).`);

    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const usage = data.usageMetadata ?? {};

    return {
      content,
      model,
      usage: {
        inputTokens: usage.promptTokenCount ?? 0,
        outputTokens: usage.candidatesTokenCount ?? 0,
        totalTokens: usage.totalTokenCount ?? 0,
      },
      finishReason:
        data.candidates?.[0]?.finishReason === 'STOP' ? 'stop' : 'length',
    };
  }

  async complete(prompt: string, options: AIOptions = {}): Promise<string> {
    const response = await this.chat(
      [{ role: 'user', content: prompt }],
      options
    );
    return response.content;
  }

  /**
   * Rough cost estimate in USD.
   * Based on approximate Gemini pricing (check current pricing).
   */
  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gemini-3.7-flash': { input: 0.000075, output: 0.0003 },
      'gemini-3.5-flash-lite': { input: 0.0000375, output: 0.00015 },
    };
    const p = pricing[model] ?? pricing['gemini-3.7-flash'];
    return (inputTokens / 1000) * p.input + (outputTokens / 1000) * p.output;
  }
}
