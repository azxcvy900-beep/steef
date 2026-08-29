// ============================================================
// Executive Agent — Core Agent Loop
// ============================================================

import type { AIProvider } from '@/ai/AIProviderInterface';
import type {
  AgentInput,
  AgentOutput,
  ClassificationResult,
  IntentType,
} from '@/types/agent.types';
import { AuditLogger } from '@/audit/AuditLogger';
import { permissionManager } from '@/permissions/PermissionManager';

const getExecutiveSystemPrompt = (memories: string) => `أنت وكيل تنفيذي شخصي متقدم. اسمك "سيف".

مهمتك الأساسية هي مساعدة المستخدم في:
- إدارة المهام والمشاريع والأفكار
- التخطيط واتخاذ القرارات

معلومات عن المستخدم (الذاكرة طويلة المدى):
${memories || 'لا توجد معلومات مسجلة بعد.'}

قواعد أساسية:
1. تحدث دائماً بالعربية ما لم يطلب المستخدم غير ذلك.
2. كن دقيقاً وواضحاً وموجزاً.
3. لا تنفذ أي إجراء مهم بدون موافقة صريحة من المستخدم.
4. عندما تحتاج إلى موافقة، اشرح بوضوح: ما الإجراء المطلوب، لماذا مطلوب، وما المخاطر.
5. احتفظ دائماً بسجل دقيق لما تفعله.
6. لا تتجاوز الصلاحيات الممنوحة لك.
7. كن صادقاً دائماً. إذا لم تستطع تنفيذ شيء، قل ذلك بوضوح.`;

const CLASSIFICATION_PROMPT = `حلل طلب المستخدم وصنفه في تنسيق JSON. استخرج أي إجراء (action) مطلوب لتحديث قاعدة البيانات.

طلب المستخدم: "{message}"

الرجاء إعادة JSON فقط بهذا الشكل:
{
  "intent": "TASK|PROJECT|IDEA|DECISION|DEVELOPMENT|REPORT|QUERY|SETTINGS|UNKNOWN",
  "confidence": 0.95,
  "action": {
    "type": "NONE|CREATE_TASK|SAVE_MEMORY",
    "data": {
      "title": "عنوان المهمة",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "content": "محتوى الذاكرة للتذكر",
      "memoryType": "FACT|PREFERENCE"
    }
  },
  "arabic_summary": "ملخص قصير للطلب بالعربية"
}`;

export class ExecutiveAgent {
  private aiProvider: AIProvider;
  private memoryRepo: any; // We will inject this properly
  private taskRepo: any;

  constructor(aiProvider: AIProvider, memoryRepo?: any, taskRepo?: any) {
    this.aiProvider = aiProvider;
    this.memoryRepo = memoryRepo;
    this.taskRepo = taskRepo;
  }

  /**
   * Main agent loop:
   * UNDERSTAND → CLASSIFY → RETRIEVE → PLAN → CHECK PERMISSIONS → EXECUTE/REQUEST → VERIFY → UPDATE MEMORY → REPORT
   */
  async run(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const actionsPerformed: string[] = [];
    let memoryUpdated = false;

    await AuditLogger.log({
      userId: input.userId,
      actor: 'user',
      agentType: 'executive_agent',
      action: 'agent_loop_start',
      summarizedInput: input.message.slice(0, 200),
      status: 'SUCCESS',
    });

    try {
      // ── STEP 1: RETRIEVE MEMORY ──────────────────────────────
      let memoriesStr = '';
      if (this.memoryRepo) {
        const memories = await this.memoryRepo.getMemoriesByUser(input.userId, 10);
        memoriesStr = memories.map((m: any) => `- ${m.content}`).join('\n');
      }

      // ── STEP 2: CLASSIFY & EXTRACT ACTION ────────────────────
      const classification: any = await this.classify(input.message);
      actionsPerformed.push(`classified_as_${classification.intent}`);

      // ── STEP 3: CHECK PERMISSIONS ────────────────────────────
      const actionNeeded = this.intentToAction(classification.intent);
      const permission = permissionManager.check(actionNeeded);

      if (permission.level === 'BLOCKED') {
        return {
          response: `عذراً، هذا الإجراء (${permission.description}) محظور ولا يمكنني تنفيذه. هذا قيد أمني دائم.`,
          intent: classification.intent,
          status: 'BLOCKED',
          actionsPerformed,
          memoryUpdated,
        };
      }

      // ── STEP 4: EXECUTE DB ACTION IF NEEDED ──────────────────
      if (classification.action && classification.action.type !== 'NONE') {
        try {
          if (classification.action.type === 'CREATE_TASK' && this.taskRepo) {
            await this.taskRepo.create(crypto.randomUUID(), {
              title: classification.action.data.title || input.message,
              status: 'TODO',
              priority: classification.action.data.priority || 'MEDIUM',
            }, input.userId); // Pass ownerId for authorization
            actionsPerformed.push('created_task');
          } else if (classification.action.type === 'SAVE_MEMORY' && this.memoryRepo) {
            await this.memoryRepo.create(crypto.randomUUID(), {
              type: classification.action.data.memoryType || 'FACT',
              content: classification.action.data.content,
              importance: 3,
            }, input.userId); // Pass ownerId for authorization
            actionsPerformed.push('saved_memory');
            memoryUpdated = true;
          }
        } catch (dbError) {
          console.error('[ExecutiveAgent] DB Action Failed:', dbError);
        }
      }

      // ── STEP 5: GENERATE RESPONSE ─────────────────────────────
      const messages = [
        ...input.conversationHistory.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        { role: 'user' as const, content: input.message },
      ];

      const aiResponse = await this.aiProvider.chat(messages, {
        systemPrompt: getExecutiveSystemPrompt(memoriesStr),
        model: this.aiProvider.defaultModel,
        temperature: 0.7,
      });

      const duration = Date.now() - startTime;

      await AuditLogger.log({
        userId: input.userId,
        actor: 'executive_agent',
        agentType: 'executive_agent',
        action: 'agent_loop_complete',
        summarizedInput: input.message.slice(0, 200),
        summarizedOutput: aiResponse.content.slice(0, 300),
        status: 'SUCCESS',
      });

      return {
        response: aiResponse.content,
        intent: classification.intent,
        status: 'SUCCESS',
        actionsPerformed,
        memoryUpdated,
        metadata: {
          classification,
          duration,
          model: aiResponse.model,
          tokens: aiResponse.usage.totalTokens,
        },
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';

      await AuditLogger.log({
        userId: input.userId,
        actor: 'executive_agent',
        agentType: 'executive_agent',
        action: 'agent_loop_error',
        status: 'FAILED',
        summarizedOutput: errMsg,
      });

      return {
        response:
          'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى. إذا استمرت المشكلة، يرجى التواصل مع الدعم.',
        intent: 'UNKNOWN',
        status: 'FAILED',
        actionsPerformed: [],
        memoryUpdated: false,
        metadata: { error: errMsg },
      };
    }
  }

  private async classify(message: string): Promise<ClassificationResult> {
    try {
      const prompt = CLASSIFICATION_PROMPT.replace('{message}', message);
      const raw = await this.aiProvider.complete(prompt, {
        model: this.aiProvider.cheapModel, // Use cheap model for classification
        temperature: 0.1,
        maxTokens: 4096, // Increased to accommodate 'thinking' models that use hidden tokens
      });

      // Extract JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in classification response');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        intent: (parsed.intent as IntentType) ?? 'UNKNOWN',
        confidence: parsed.confidence ?? 0.5,
        entities: parsed.entities ?? {},
        requiresApproval: parsed.requiresApproval ?? false,
        suggestedTools: parsed.suggestedTools ?? [],
        action: parsed.action // Added action
      };
    } catch (err) {
      console.error('[ExecutiveAgent] Classification Error:', err);
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        entities: {},
        requiresApproval: false,
        suggestedTools: [],
      };
    }
  }

  private intentToAction(intent: IntentType): string {
    const map: Record<IntentType, string> = {
      TASK: 'create_task',
      PROJECT: 'create_project',
      IDEA: 'create_idea',
      DECISION: 'create_decision',
      DEVELOPMENT: 'modify_code',
      REPORT: 'generate_report',
      QUERY: 'read_tasks',
      APPROVAL_RESPONSE: 'read_tasks',
      SETTINGS: 'read_tasks',
      UNKNOWN: 'read_tasks',
    };
    return map[intent] ?? 'read_tasks';
  }
}
