'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Mic,
  Bot,
  User,
  ChevronUp,
  FileText,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS: Record<string, { label: string; prompt: string }[]> = {
  '/dashboard': [
    { label: 'Summarize Today\'s Risk Signals', prompt: 'Summarize our facility\'s active risk signals and overdue items today.' },
    { label: 'Explain ADHS Sentinel Event Rules', prompt: 'What qualifies as a reportable adverse event under Arizona ADHS R9-10?' },
  ],
  '/calendar': [
    { label: 'Check Upcoming Survey Windows', prompt: 'What Joint Commission and CMS survey windows are open in the next 90 days?' },
    { label: 'NFPA Fire Drill Rules', prompt: 'What are the quarterly NFPA 101 fire drill requirements for psych facilities?' },
  ],
  '/trackers/incidents': [
    { label: 'Draft Incident RCA', prompt: 'Help me draft a 5-Why Root Cause Analysis for a patient fall.' },
    { label: 'AZ ADHS 24h Reporting Checklist', prompt: 'What incidents must be reported to AZ ADHS within 24 hours?' },
  ],
  '/board-report': [
    { label: 'Executive Summary Brief', prompt: 'Summarize our QAPI and compliance metrics into a 3-bullet board briefing.' },
  ],
};

export function FloatingAiCoPilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Sentry AI 🤖. Ask me any regulatory question, draft policy wording, or request an instant RCA for your active page.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeActions = QUICK_ACTIONS[pathname] || [
    { label: 'Ask Regulatory Question', prompt: 'What are the top 3 CMS CoP compliance priorities for psych hospitals?' },
    { label: 'Draft CAP Language', prompt: 'Help me draft a SMART Corrective Action Plan for a documentation gap.' },
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('AI response error');
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply || 'I am ready to assist.' }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sentry AI is ready. Under Arizona ADHS R9-10 and Joint Commission CAMH standards, all clinical observations and sentinel events must be documented within 24 hours.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setInput('Summarize our Arizona ADHS restraint and seclusion reporting requirements.');
      setIsListening(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Expanded AI Drawer */}
      {isOpen && (
        <div className="bg-card/95 backdrop-blur-md border border-teal-500/40 rounded-2xl w-80 sm:w-96 shadow-2xl overflow-hidden mb-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-200 flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-950 to-cyan-950 p-4 border-b border-teal-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-pulse text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Sentry AI Co-Pilot</h3>
                <p className="text-[10px] text-teal-300">Arizona & TJC Regulatory Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-teal-300 hover:text-white p-1 rounded-lg hover:bg-teal-900/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[220px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn('flex gap-2.5 text-xs', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    'p-3 rounded-xl max-w-[85%] leading-relaxed',
                    m.role === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-muted/80 text-foreground border border-border/60 rounded-bl-none'
                  )}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-teal-400">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Sentry AI thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Pills */}
          <div className="p-2.5 bg-muted/40 border-t border-border/60 flex flex-wrap gap-1.5">
            {activeActions.map((act, i) => (
              <button
                key={i}
                onClick={() => handleSend(act.prompt)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-all text-left truncate max-w-full"
              >
                ⚡ {act.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-card border-t border-border/60 flex items-center gap-2">
            <button
              type="button"
              onClick={simulateVoiceInput}
              title="Voice Input Simulation"
              className={cn(
                'p-2 rounded-lg text-xs transition-all border',
                isListening
                  ? 'bg-red-500 text-white border-red-400 animate-pulse'
                  : 'bg-muted text-muted-foreground hover:text-foreground border-border'
              )}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening...' : 'Ask Sentry AI...'}
              className="flex-1 text-xs p-2 bg-muted border border-border/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-2xl shadow-teal-900/50 hover:scale-105 group border border-teal-400/40"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span>Ask Sentry AI</span>
        {isOpen ? <X className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />}
      </button>
    </div>
  );
}
