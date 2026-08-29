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
  readonly defaultModel = 'gemini-2.0-flash';
  readonly cheapModel = 'gemini-2.0-flash-lite';
  readonly powerfulModel = 'gemini-1.5-pro';

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

    const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[GeminiProvider] API error ${res.status}: ${err}`);
    }

    const data = await res.json();

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
      'gemini-2.0-flash': { input: 0.000075, output: 0.0003 },
      'gemini-2.0-flash-lite': { input: 0.0000375, output: 0.00015 },
      'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    };
    const p = pricing[model] ?? pricing['gemini-2.0-flash'];
    return (inputTokens / 1000) * p.input + (outputTokens / 1000) * p.output;
  }
}
