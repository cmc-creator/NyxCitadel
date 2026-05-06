'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Send, CheckCircle2, Clock, Plus, X, Mail } from 'lucide-react';

interface AckRecord {
  id: string;
  staffName: string;
  staffEmail: string;
  sentAt: string;
  sentBy: string;
  acknowledgedAt: string | null;
}

interface Recipient { name: string; email: string }

export default function PolicyAckPanel({ policyId }: { policyId: string }) {
  const [acks, setAcks] = useState<AckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '' }]);
  const [changeNote, setChangeNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const loadAcks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/policies/${policyId}/acknowledgments`);
      const data = await res.json();
      if (Array.isArray(data)) setAcks(data);
    } catch {}
    setLoading(false);
  }, [policyId]);

  useEffect(() => { loadAcks(); }, [loadAcks]);

  function addRecipient() {
    setRecipients(r => [...r, { name: '', email: '' }]);
  }

  function removeRecipient(i: number) {
    setRecipients(r => r.filter((_, idx) => idx !== i));
  }

  function updateRecipient(i: number, field: 'name' | 'email', value: string) {
    setRecipients(r => r.map((rec, idx) => idx === i ? { ...rec, [field]: value } : rec));
  }

  async function sendRequests() {
    const valid = recipients.filter(r => r.name.trim() && r.email.trim());
    if (!valid.length) { setSendError('Add at least one recipient with name and email.'); return; }
    setSending(true);
    setSendError('');
    try {
      const res = await fetch(`/api/policies/${policyId}/acknowledgments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients: valid, changeNote: changeNote.trim() || undefined }),
      });
      const data = await res.json();
      if (data.sent > 0) {
        setModalOpen(false);
        setRecipients([{ name: '', email: '' }]);
        setChangeNote('');
        loadAcks();
      } else {
        setSendError(data.error ?? 'No requests sent.');
      }
    } catch {
      setSendError('Failed to send. Please try again.');
    }
    setSending(false);
  }

  const pending = acks.filter(a => !a.acknowledgedAt);
  const acknowledged = acks.filter(a => a.acknowledgedAt);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">
            Staff Acknowledgments
          </h3>
          {acks.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
              {acknowledged.length}/{acks.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Send className="w-3 h-3" />
          Send for Acknowledgment
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground/60 py-2">Loading&hellip;</p>
      ) : acks.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2 text-center">
          No acknowledgment requests sent yet.
        </p>
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending ({pending.length})
              </p>
              <div className="space-y-1">
                {pending.map(a => (
                  <AckRow key={a.id} ack={a} />
                ))}
              </div>
            </div>
          )}
          {acknowledged.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-700 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Acknowledged ({acknowledged.length})
              </p>
              <div className="space-y-1">
                {acknowledged.map(a => (
                  <AckRow key={a.id} ack={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Send Acknowledgment Requests</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Change Note (optional)
                </label>
                <input
                  type="text"
                  value={changeNote}
                  onChange={e => setChangeNote(e.target.value)}
                  placeholder="Brief note about what changed or why acknowledgment is needed"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Recipients</label>
                  <button
                    onClick={addRecipient}
                    className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  {recipients.map((r, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={r.name}
                        onChange={e => updateRecipient(i, 'name', e.target.value)}
                        placeholder="Full Name"
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="email"
                        value={r.email}
                        onChange={e => updateRecipient(i, 'email', e.target.value)}
                        placeholder="email@facility.org"
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      {recipients.length > 1 && (
                        <button onClick={() => removeRecipient(i)} className="text-gray-300 hover:text-red-400 shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {sendError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{sendError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={sendRequests}
                disabled={sending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                {sending ? 'Sending\u2026' : `Send${recipients.filter(r => r.name && r.email).length > 1 ? ` (${recipients.filter(r => r.name && r.email).length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AckRow({ ack }: { ack: AckRecord }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50">
      <div>
        <p className="text-xs font-medium text-foreground">{ack.staffName}</p>
        <p className="text-xs text-muted-foreground/60">{ack.staffEmail}</p>
      </div>
      <div className="text-right shrink-0">
        {ack.acknowledgedAt ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-xs">
              {new Date(ack.acknowledgedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-amber-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">Pending</span>
          </div>
        )}
      </div>
    </div>
  );
}
