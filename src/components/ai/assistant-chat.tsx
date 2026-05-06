'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_PROMPTS = [
  "What's overdue in my compliance calendar?",
  "Help me write a CAP for a restraint event",
  "What does JC standard EM.03.01.03 require?",
  "Explain CMS QAPI requirements for psych hospitals",
  "Draft a de-escalation policy statement for AZ",
  "What are the HBIPS quality measures I must track?",
];

const PAGE_PROMPTS: Record<string, string[]> = {
  '/trackers/incidents': [
    "Help me describe this incident clearly for the record",
    "What makes an incident a sentinel event requiring RCA?",
    "What incidents must be reported to AZ ADHS within 24 hours?",
    "What should I include in Immediate Actions Taken?",
  ],
  '/trackers/rca': [
    "Walk me through the 5-Whys methodology",
    "What are common contributing factors for patient falls?",
    "Help me write the Human Factors section for an elopement",
    "What JC standard requires an RCA for sentinel events?",
  ],
  '/trackers/caps': [
    "Help me write a corrective action plan description",
    "What makes a good Measure of Success for a CAP?",
    "What are SMART goals for a compliance CAP?",
  ],
  '/trackers/grievances': [
    "What is the CMS grievance resolution timeline?",
    "What categories require expedited grievance review?",
    "Help me summarize this grievance professionally",
    "When is a grievance reportable to AZ ADHS?",
  ],
  '/quality/poc': [
    "Explain how to write a Plan of Correction",
    "What does CMS expect for the 'How Prevented' section?",
    "Help me write the monitoring strategy for a finding",
  ],
  '/quality/': [
    "What QAPI indicators should a psych hospital track?",
    "Explain HBIPS measures for behavioral health",
    "How do PDSA cycles work in quality improvement?",
  ],
  '/eoc/': [
    "What EOC standards does Joint Commission survey?",
    "Help me write a deficiency correction plan",
    "What is required in an EOC rounding program?",
  ],
  '/settings/': [
    "How do I set up my department in my profile?",
    "What do the user roles mean in NyxCitadel?",
    "How do I add a new staff member?",
  ],
  '/assistant': [
    "What JC standards should I focus on for my next survey?",
    "Help me create a CAP draft for a medication error",
    "What are the most common CMS deficiencies in psych hospitals?",
    "Draft a new incident report for a patient fall",
  ],
};

function getPagePrompts(pathname: string): string[] {
  for (const [prefix, prompts] of Object.entries(PAGE_PROMPTS)) {
    if (pathname.startsWith(prefix)) return prompts;
  }
  return DEFAULT_PROMPTS;
}

export function AssistantChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Sentry \uD83E\uDD16, your compliance assistant. I can help with JC/CMS regulatory questions, draft CAP language, explain QAPI methodology, and more. What can I help you with?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts = getPagePrompts(pathname);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history, pageContext: pathname }),
      });

      const data = await res.json() as { reply?: string; error?: string };
      const reply = data.reply ?? data.error ?? 'No response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all ${open ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open compliance assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-border flex flex-col transition-all duration-200 ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-teal-600 rounded-t-2xl flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white leading-none">Sentry \uD83E\uDD16</p>
            <p className="text-xs text-teal-200 leading-none mt-0.5">Compliance Assistant</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-teal-600' : 'bg-slate-100'}`}>
                {msg.role === 'user'
                  ? <User className="w-3.5 h-3.5 text-white" />
                  : <Bot className="w-3.5 h-3.5 text-slate-600" />
                }
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-foreground/80 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 text-muted-foreground/70 animate-spin" />
              </div>
            </div>
          )}

          {/* Page-aware suggested prompts - show only when just greeting */}
          {messages.length === 1 && !loading && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-muted-foreground/70 font-medium">Try asking:</p>
              {suggestedPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="block w-full text-left text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-950/20 px-3 py-1.5 rounded-lg border border-teal-100 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100 flex-shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask about compliance, standards, CAPs..."
            disabled={loading}
            className="flex-1 text-sm bg-slate-100 rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-teal-500 transition placeholder-slate-400 disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
