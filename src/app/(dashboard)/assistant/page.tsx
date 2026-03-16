'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, Copy, CheckCheck } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  { label: 'What is overdue?',              text: "Summarize what's currently overdue in my compliance calendar and top priorities I should address first." },
  { label: 'Draft CAP language',            text: 'Help me write a corrective action plan for a medication administration error involving a wrong dose.' },
  { label: 'HBIPS quality measures',        text: 'What are the HBIPS core measures I must track for my acute psychiatric hospital, and what are the reporting requirements?' },
  { label: 'JC EM.03.01.03',               text: 'Explain what JC standard EM.03.01.03 requires and the key evidence items surveyors look for during tracer.' },
  { label: 'AZ grievance deadlines',        text: 'Walk me through the exact CMS 482.13(e) and AZ ADHS patient grievance acknowledgment and resolution timelines.' },
  { label: 'QAPI PDSA methodology',         text: 'Explain how to run a PDSA cycle for a QAPI project targeting restraint reduction.' },
  { label: 'Sentinel event RCA',            text: 'What does a Joint Commission-compliant root cause analysis require for a sentinel event? What categories must be addressed?' },
  { label: 'AZ de-escalation rules',        text: 'What does AZ A.A.C. R9-10-308 require for de-escalation training at behavioral health facilities?' },
];

function MessageBubble({ msg, onCopy }: { msg: Message; onCopy: (text: string) => void }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-purple-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`group max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-purple-600 text-white rounded-tr-sm'
            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
        }`}>
          {msg.content}
        </div>
        {!isUser && (
          <button
            onClick={() => onCopy(msg.content)}
            className="opacity-0 group-hover:opacity-100 transition text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 ml-1"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
        )}
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm NyxAI, your compliance assistant.\n\nI can help with:\n• JC, CMS, and state regulatory questions\n• Drafting CAP, RCA, and policy language\n• Explaining QAPI methodology and PDSA cycles\n• Interpreting specific standards and requirements\n• Reviewing compliance workflows\n\nWhat would you like to work on today?",
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? data.error ?? 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm NyxAI, your compliance assistant. What would you like to work on?",
    }]);
    setInput('');
  }

  const isDefault = messages.length === 1;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">NyxAI Compliance Assistant</h1>
            <p className="text-xs text-slate-500">Powered by GPT-4o mini · JC / CMS / AZ ADHS · Acute Psychiatric</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New chat
        </button>
      </div>

      {/* Suggested prompts - show only at start */}
      {isDefault && (
        <div className="grid grid-cols-2 gap-2 mb-4 flex-shrink-0">
          {SUGGESTED_PROMPTS.map(p => (
            <button
              key={p.label}
              onClick={() => void sendMessage(p.text)}
              className="text-left text-xs bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
            >
              <p className="font-semibold text-slate-700 group-hover:text-purple-700">{p.label}</p>
              <p className="text-slate-400 mt-0.5 line-clamp-2">{p.text}</p>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} onCopy={handleCopy} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-purple-500 animate-spin" />
              <span className="text-xs text-slate-400">NyxAI is thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm flex items-end gap-3 p-3 mt-2">
        {copied && (
          <span className="absolute -top-8 right-0 text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
            <CheckCheck className="w-3 h-3" /> Copied
          </span>
        )}
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about JC standards, draft CAP language, explain ADHS requirements… (Enter to send, Shift+Enter for new line)"
          className="flex-1 resize-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none max-h-32 overflow-auto leading-relaxed"
          style={{ minHeight: '1.5rem' }}
        />
        <button
          onClick={() => void sendMessage()}
          disabled={!input.trim() || loading}
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-center text-[11px] text-slate-400 mt-2">
        AI responses may be inaccurate. Always verify against official regulatory publications before acting.
      </p>
    </div>
  );
}
