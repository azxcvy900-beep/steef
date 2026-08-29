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

const EXECUTIVE_SYSTEM_PROMPT = `أنت وكيل تنفيذي شخصي متقدم. اسمك "سيف".

مهمتك الأساسية هي مساعدة المستخدم في:
- إدارة المهام والمشاريع والأفكار
- التخطيط واتخاذ القرارات
- متابعة التقدم والإنجازات
- التنسيق مع الوكيل المطور لمهام البرمجة

قواعد أساسية:
1. تحدث دائماً بالعربية ما لم يطلب المستخدم غير ذلك.
2. كن دقيقاً وواضحاً وموجزاً.
3. لا تنفذ أي إجراء مهم بدون موافقة صريحة من المستخدم.
4. عندما تحتاج إلى موافقة، اشرح بوضوح: ما الإجراء المطلوب، لماذا مطلوب، وما المخاطر.
5. احتفظ دائماً بسجل دقيق لما تفعله.
6. لا تتجاوز الصلاحيات الممنوحة لك.

عند فهم طلب المستخدم، حدد:
- نوع الطلب (مهمة / مشروع / فكرة / قرار / تطوير / تقرير / استفسار)
- الأولوية
- هل يحتاج موافقة
- ما الأدوات المطلوبة

كن صادقاً دائماً. إذا لم تستطع تنفيذ شيء، قل ذلك بوضوح.`;

const CLASSIFICATION_PROMPT = `حلل طلب المستخدم وصنفه في تنسيق JSON.

طلب المستخدم: "{message}"

أعد JSON فقط بهذا الشكل بالضبط:
{
  "intent": "TASK|PROJECT|IDEA|DECISION|DEVELOPMENT|REPORT|QUERY|SETTINGS|UNKNOWN",
  "confidence": 0.95,
  "entities": {
    "title": "عنوان إن وجد",
    "priority": "LOW|MEDIUM|HIGH|CRITICAL أو null",
    "deadline": "تاريخ إن ذكر أو null",
    "projectName": "اسم المشروع إن ذكر أو null"
  },
  "requiresApproval": false,
  "suggestedTools": [],
  "arabic_summary": "ملخص قصير للطلب بالعربية"
}`;

export class ExecutiveAgent {
  private aiProvider: AIProvider;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;
  }

  /**
   * Main agent loop:
   * UNDERSTAND → CLASSIFY → RETRIEVE → PLAN → CHECK PERMISSIONS → EXECUTE/REQUEST → VERIFY → UPDATE MEMORY → REPORT
   */
  async run(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();

    await AuditLogger.log({
      userId: input.userId,
      actor: 'user',
      agentType: 'executive_agent',
      action: 'agent_loop_start',
      summarizedInput: input.message.slice(0, 200),
      status: 'SUCCESS',
    });

    try {
      // ── STEP 1: CLASSIFY ─────────────────────────────────────
      const classification = await this.classify(input.message);

      // ── STEP 2: CHECK PERMISSIONS ────────────────────────────
      const actionNeeded = this.intentToAction(classification.intent);
      const permission = permissionManager.check(actionNeeded);

      if (permission.level === 'BLOCKED') {
        await AuditLogger.log({
          userId: input.userId,
          actor: 'executive_agent',
          agentType: 'executive_agent',
          action: actionNeeded,
          status: 'BLOCKED',
          summarizedInput: input.message.slice(0, 200),
          summarizedOutput: 'Action is blocked by permission policy',
        });

        return {
          response: `عذراً، هذا الإجراء (${permission.description}) محظور ولا يمكنني تنفيذه. هذا قيد أمني دائم.`,
          intent: classification.intent,
          status: 'BLOCKED',
          actionsPerformed: [],
          memoryUpdated: false,
        };
      }

      // ── STEP 3: GENERATE RESPONSE ─────────────────────────────
      const messages = [
        ...input.conversationHistory.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        { role: 'user' as const, content: input.message },
      ];

      const aiResponse = await this.aiProvider.chat(messages, {
        systemPrompt: EXECUTIVE_SYSTEM_PROMPT,
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
        actionsPerformed: [`classified_as_${classification.intent}`, 'generated_response'],
        memoryUpdated: false, // Phase 3: will update memory
        metadata: {
          classification,
          duration,
          model: aiResponse.model,
          tokens: aiResponse.usage.totalTokens,
          estimatedCost: this.aiProvider.estimateCost(
            aiResponse.usage.inputTokens,
            aiResponse.usage.outputTokens,
            aiResponse.model
          ),
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
        maxTokens: 512,
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
      };
    } catch {
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
