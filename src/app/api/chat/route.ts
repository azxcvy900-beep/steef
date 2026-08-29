// ============================================================
// Chat API Route — /api/chat
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { ExecutiveAgent } from '@/agents/executive/ExecutiveAgent';
import { GeminiProvider } from '@/ai/GeminiProvider';
import type { AgentInput, Message } from '@/types/agent.types';

import { MemoryRepository } from '@/repositories/MemoryRepository';
import { TaskRepository } from '@/repositories/TaskRepository';

// Initialize AI provider and agent (singleton pattern)
function getAgent(): ExecutiveAgent {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  const provider = new GeminiProvider(apiKey);
  const memoryRepo = new MemoryRepository();
  const taskRepo = new TaskRepository();
  return new ExecutiveAgent(provider, memoryRepo, taskRepo);
}

export async function POST(req: NextRequest) {
  try {
    console.log('[API/CHAT] Request received');
    const body = await req.json();
    const { message, conversationHistory = [], userId = 'user_001' } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة ولا يمكن أن تكون فارغة' },
        { status: 400 }
      );
    }

    const agent = getAgent();
    console.log('[API/CHAT] Agent and Provider initialized. Calling Agent run loop...');

    const input: AgentInput = {
      message: message.trim(),
      userId,
      conversationHistory: (conversationHistory as Message[]).slice(-20), // Last 20 messages for context
    };

    const output = await agent.run(input);
    console.log('[API/CHAT] Agent run loop completed with status:', output.status);

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
