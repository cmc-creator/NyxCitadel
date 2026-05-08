'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, Copy, CheckCheck } from 'lucide-react';
import { ActionSuggestion, DraftActionType, buildActionPreview } from '@/lib/ai/sentry-actions';

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
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-teal-600' : 'bg-gradient-to-br from-teal-600 to-cyan-600'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`group max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-teal-600 text-white rounded-tr-sm'
            : 'bg-card border border-border text-muted-foreground rounded-tl-sm shadow-sm'
        }`}>
          {msg.content}
        </div>
        {!isUser && (
          <button
            onClick={() => onCopy(msg.content)}
            className="opacity-0 group-hover:opacity-100 transition text-xs text-muted-foreground/70 hover:text-foreground/80 flex items-center gap-1 ml-1"
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
      content: "Hi! I'm Sentry 🤖, your compliance assistant.\n\nI can help with:\n• JC, CMS, and state regulatory questions\n• Drafting CAP, RCA, and policy language\n• Explaining QAPI methodology and PDSA cycles\n• Interpreting specific standards and requirements\n• Reviewing compliance workflows\n\nI can also prepare safe draft records for CAPs, incident reports, and calendar events when you ask.\n\nWhat would you like to work on today?",
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionSuggestion | null>(null);
  const [actionEdits, setActionEdits] = useState<Record<string, string>>({});
  const [runningAction, setRunningAction] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!pendingAction) {
      setActionEdits({});
      return;
    }

    const nextEdits: Record<string, string> = {};
    for (const field of buildActionPreview(pendingAction)) {
      nextEdits[field.key] = field.value === 'Not provided' ? '' : field.value;
    }
    setActionEdits(nextEdits);
  }, [pendingAction]);

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
      const data = await res.json() as { reply?: string; error?: string; actionSuggestion?: ActionSuggestion | null };
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? data.error ?? 'No response.' }]);
      setPendingAction(data.actionSuggestion ?? null);
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
      content: "Hi! I'm Sentry 🤖, your compliance assistant. What would you like to work on?",
    }]);
    setInput('');
    setPendingAction(null);
    setActionEdits({});
  }

  async function runDraftAction() {
    if (!pendingAction || runningAction) return;
    setRunningAction(true);
    try {
      const updatedPayload = {
        ...pendingAction.payload,
        ...Object.fromEntries(
          Object.entries(actionEdits).map(([key, value]) => [key, value.trim()])
        ),
      };

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionRequest: { ...pendingAction, payload: updatedPayload } }),
      });
      const data = await res.json() as {
        ok?: boolean;
        error?: string;
        created?: { type: string; id: string; label: string; href: string };
      };

      const created = data.created;
      if (data.ok && created) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Done. I created a draft ${created.type} record (${created.label}). Open it here: ${created.href}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error ?? 'I could not create that draft record.' },
        ]);
      }
      setPendingAction(null);
      setActionEdits({});
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I hit an error while creating the draft record. Please try again.' },
      ]);
    } finally {
      setRunningAction(false);
    }
  }

  function actionLabel(type: DraftActionType) {
    if (type === 'CREATE_CAP_DRAFT') return 'Create draft CAP';
    if (type === 'CREATE_INCIDENT_DRAFT') return 'Create draft incident report';
    return 'Create draft calendar event';
  }

  const isDefault = messages.length === 1;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Sentry 🤖 Compliance Assistant</h1>
            <p className="text-xs text-muted-foreground">Powered by Claude 3.5 Haiku · JC / CMS / AZ ADHS · Acute Psychiatric</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal-700 hover:bg-teal-950/20 px-3 py-1.5 rounded-lg border border-border transition"
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
              className="text-left text-xs bg-card border border-border rounded-xl px-4 py-3 hover:border-teal-300 hover:bg-teal-950/20 transition-colors group"
            >
              <p className="font-semibold text-foreground/80 group-hover:text-teal-700">{p.label}</p>
              <p className="text-muted-foreground/70 mt-0.5 line-clamp-2">{p.text}</p>
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-teal-500 animate-spin" />
              <span className="text-xs text-muted-foreground/70">Sentry is thinking…</span>
            </div>
          </div>
        )}

        {pendingAction && (
          <div className="rounded-xl border border-teal-800/50 bg-teal-950/20 px-4 py-3">
            <p className="text-xs font-semibold text-teal-700 mb-2">Sentry prepared a safe draft action</p>
            <p className="text-xs text-teal-700/80 mb-2">Review and edit these fields before creating the draft record.</p>
            <div className="rounded-lg border border-teal-800/30 bg-teal-950/30 px-3 py-2 mb-3 space-y-2">
              {buildActionPreview(pendingAction).map((item) => (
                <div key={item.key} className="grid grid-cols-[120px_1fr] gap-2 items-center text-xs">
                  <label className="font-semibold text-teal-900" htmlFor={`action-${item.key}`}>{item.label}</label>
                  <input
                    id={`action-${item.key}`}
                    value={actionEdits[item.key] ?? ''}
                    onChange={(e) => setActionEdits((prev) => ({ ...prev, [item.key]: e.target.value }))}
                    className="w-full rounded-md border border-teal-100 bg-teal-950/20/40 px-2 py-1.5 text-foreground/80 outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void runDraftAction()}
                disabled={runningAction}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 px-3 py-2 text-xs font-semibold text-white transition"
              >
                {runningAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {actionLabel(pendingAction.type)}
              </button>
              <button
                onClick={() => setPendingAction(null)}
                className="rounded-lg border border-teal-700/40 bg-teal-900/30 px-3 py-2 text-xs font-medium text-teal-300 hover:bg-teal-800/40 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-card border border-border rounded-xl shadow-sm flex items-end gap-3 p-3 mt-2">
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
          className="flex-1 resize-none text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none max-h-32 overflow-auto leading-relaxed"
          style={{ minHeight: '1.5rem' }}
        />
        <button
          onClick={() => void sendMessage()}
          disabled={!input.trim() || loading}
          title="Send message"
          className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-center text-[11px] text-muted-foreground/70 mt-2">
        AI responses may be inaccurate. Always verify against official regulatory publications before acting.
      </p>
    </div>
  );
}
