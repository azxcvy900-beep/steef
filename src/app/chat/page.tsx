'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn, formatRelativeAr } from '@/lib/utils';
import type { Message } from '@/types/agent.types';

interface ChatMessage extends Message {
  isLoading?: boolean;
}

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `مرحباً! أنا **سيف**، وكيلك التنفيذي الشخصي. 👋

يمكنني مساعدتك في:
- 📋 **إدارة المهام والمشاريع**
- 💡 **تنظيم الأفكار والقرارات**
- 📊 **توليد التقارير اليومية**
- 🔧 **التنسيق مع وكيل التطوير**

كيف يمكنني مساعدتك اليوم؟`,
  timestamp: new Date(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const loadingMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => !m.isLoading)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: history,
          userId: 'user_001', // Phase 2: replace with real auth
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        isLoading: false,
        content: res.ok
          ? data.response
          : 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
        metadata: res.ok ? data.metadata : undefined,
      };

      setMessages((prev) =>
        prev.map((m) => (m.isLoading ? assistantMsg : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.isLoading
            ? {
                ...m,
                isLoading: false,
                content: 'عذراً، لم أتمكن من الاتصال بالخادم. تحقق من الاتصال.',
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-800 bg-gray-900 p-4">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)"
            rows={1}
            className={cn(
              'flex-1 resize-none bg-gray-800 border border-gray-700 rounded-xl',
              'px-4 py-3 text-gray-100 placeholder-gray-500',
              'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
              'text-sm leading-relaxed min-h-[48px] max-h-[200px]',
              'transition-all duration-200',
              'font-cairo'
            )}
            style={{
              height: 'auto',
              minHeight: '48px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
              'bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700',
              'disabled:cursor-not-allowed transition-colors duration-200',
              'text-white shadow-lg'
            )}
            aria-label="إرسال"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          سيف يعمل على نموذج Gemini — جميع الإجراءات المهمة تتطلب موافقتك
        </p>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  const avatar = (
    <div
      className={cn(
        'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold',
        isUser
          ? 'bg-indigo-600 text-white'
          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
      )}
    >
      {isUser ? 'أ' : '⚡'}
    </div>
  );

  return (
    <div
      className={cn(
        'flex w-full message-enter',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className="flex gap-3 max-w-[85%]">
        {!isUser && avatar}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-hidden',
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700',
            message.isLoading && 'opacity-70'
          )}
        >
          {message.isLoading ? (
            <TypingIndicator />
          ) : (
            <FormattedContent content={message.content || '...'} />
          )}

          {!message.isLoading && (
            <div
              className={cn(
                'text-xs mt-2 opacity-50',
                isUser ? 'text-indigo-200 text-right' : 'text-gray-400 text-left'
              )}
            >
              {formatRelativeAr(message.timestamp)}
            </div>
          )}
        </div>

        {isUser && avatar}
      </div>
    </div>
  );
}

function FormattedContent({ content }: { content: string }) {
  // Simple markdown-like formatting
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p
            key={i}
            dangerouslySetInnerHTML={{ __html: formatted }}
            className={line.startsWith('-') ? 'pr-2' : ''}
          />
        );
      })}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center h-5 px-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5 -rotate-90"
    >
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  );
}
