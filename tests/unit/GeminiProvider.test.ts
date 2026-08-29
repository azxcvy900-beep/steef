// ============================================================
// Unit Tests — GeminiProvider abstraction
// ============================================================

import { GeminiProvider } from '@/ai/GeminiProvider';

describe('GeminiProvider', () => {
  it('should implement AIProvider interface correctly', () => {
    const provider = new GeminiProvider('test-key');
    expect(provider.name).toBe('google-gemini');
    expect(provider.defaultModel).toBeDefined();
    expect(provider.cheapModel).toBeDefined();
    expect(provider.powerfulModel).toBeDefined();
    expect(typeof provider.chat).toBe('function');
    expect(typeof provider.complete).toBe('function');
    expect(typeof provider.estimateCost).toBe('function');
  });

  it('should throw if no API key is provided', () => {
    expect(() => new GeminiProvider('')).toThrow();
  });

  it('should estimate cost correctly', () => {
    const provider = new GeminiProvider('test-key');
    const cost = provider.estimateCost(1000, 500, 'gemini-2.0-flash');
    expect(cost).toBeGreaterThan(0);
    expect(typeof cost).toBe('number');
  });

  it('cheap model should cost less than powerful model', () => {
    const provider = new GeminiProvider('test-key');
    const cheapCost = provider.estimateCost(1000, 500, provider.cheapModel);
    const powerfulCost = provider.estimateCost(1000, 500, provider.powerfulModel);
    expect(cheapCost).toBeLessThanOrEqual(powerfulCost);
  });
});
