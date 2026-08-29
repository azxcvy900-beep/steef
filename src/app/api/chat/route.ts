// ============================================================
// Chat API Route — /api/chat
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { ExecutiveAgent } from '@/agents/executive/ExecutiveAgent';
import { GeminiProvider } from '@/ai/GeminiProvider';
import type { AgentInput, Message } from '@/types/agent.types';

// Initialize AI provider and agent (singleton pattern)
function getAgent(): ExecutiveAgent {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  const provider = new GeminiProvider(apiKey);
  return new ExecutiveAgent(provider);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory = [], userId = 'anonymous' } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة ولا يمكن أن تكون فارغة' },
        { status: 400 }
      );
    }

    const agent = getAgent();

    const input: AgentInput = {
      message: message.trim(),
      userId,
      conversationHistory: (conversationHistory as Message[]).slice(-20), // Last 20 messages for context
    };

    const output = await agent.run(input);

    return NextResponse.json({
      response: output.response,
      intent: output.intent,
      status: output.status,
      actionsPerformed: output.actionsPerformed,
      approvalRequested: output.approvalRequested,
      metadata: output.metadata,
    });
  } catch (error) {
    console.error('[/api/chat] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب', details: message },
      { status: 500 }
    );
  }
}
