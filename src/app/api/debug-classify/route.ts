import { NextResponse } from 'next/server';
import { GeminiProvider } from '@/ai/GeminiProvider';
import { ExecutiveAgent } from '@/agents/executive/ExecutiveAgent';

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No API key' });
  
  try {
    const body = await req.json();
    const provider = new GeminiProvider(apiKey);
    const agent = new ExecutiveAgent(provider, null, null);
    
    // Override complete to capture raw and finish reason
    const originalComplete = provider.complete.bind(provider);
    let capturedRaw = '';
    let captureFinish = '';
    
    // We also need to hack chat to capture finishReason
    const originalChat = provider.chat.bind(provider);
    provider.chat = async (msgs, opts) => {
      const res = await originalChat(msgs, opts);
      captureFinish = res.finishReason || 'unknown';
      return res;
    };

    provider.complete = async (prompt, opts) => {
      capturedRaw = await originalComplete(prompt, opts);
      return capturedRaw;
    };
    
    const classification = await (agent as any).classify(body.message);
    return NextResponse.json({ classification, raw: capturedRaw, finishReason: captureFinish });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
