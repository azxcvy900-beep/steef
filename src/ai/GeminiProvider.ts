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
    console.log(`[GeminiProvider] Request Body:`, JSON.stringify(body).slice(0, 300) + '...');

    const res = await fetch(actualUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log(`[GeminiProvider] Gemini HTTP Status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const err = await res.text();
      console.error(`[GeminiProvider] Gemini Error Code/Message:`, err);
      throw new Error(`[GeminiProvider] API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    console.log(`[GeminiProvider] Response parsed successfully.`);

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
