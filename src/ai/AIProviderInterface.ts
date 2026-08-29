// ============================================================
// AI Provider Abstraction
// ============================================================

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'error';
}

/**
 * Abstract AI Provider interface.
 * All AI providers must implement this contract.
 * The agent core NEVER depends on a specific provider SDK.
 */
export interface AIProvider {
  readonly name: string;
  readonly defaultModel: string;
  readonly cheapModel: string;    // For simple tasks (classification, routing)
  readonly powerfulModel: string; // For complex reasoning (planning, development)

  chat(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>;
  complete(prompt: string, options?: AIOptions): Promise<string>;
  estimateCost(inputTokens: number, outputTokens: number, model: string): number;
}
