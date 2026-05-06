'use client';

import { useState } from 'react';
import { UserPlus, X, Send } from 'lucide-react';

const CATEGORIES = [
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'ORIENTATION', label: 'Orientation' },
  { value: 'COMPETENCY', label: 'Competency' },
  { value: 'POLICY_CHANGE', label: 'Policy Change' },
  { value: 'DISCIPLINARY', label: 'Disciplinary' },
  { value: 'REGULATORY', label: 'Regulatory' },
  { value: 'OTHER', label: 'Other' },
];

export function TrainingAssignButton({ onAssigned }: { onAssigned?: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    staffName: '',
    staffEmail: '',
    trainingName: '',
    category: 'ANNUAL',
    department: '',
    jobTitle: '',
    isRequired: true,
    expiryDate: '',
    reason: '',
    notes: '',
  });

  function field(key: keyof typeof form, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function reset() {
    setForm({
      staffName: '', staffEmail: '', trainingName: '', category: 'ANNUAL',
      department: '', jobTitle: '', isRequired: true, expiryDate: '', reason: '', notes: '',
    });
    setError('');
  }

  async function submit() {
    if (!form.staffName.trim()) { setError('Staff name is required.'); return; }
    if (!form.staffEmail.trim()) { setError('Staff email is required.'); return; }
    if (!form.trainingName.trim()) { setError('Training name is required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/training/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffName: form.staffName.trim(),
          staffEmail: form.staffEmail.trim(),
          trainingName: form.trainingName.trim(),
          category: form.category,
          department: form.department.trim() || undefined,
          jobTitle: form.jobTitle.trim() || undefined,
          isRequired: form.isRequired,
          expiryDate: form.expiryDate || undefined,
          reason: form.reason.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOpen(false);
        reset();
        onAssigned?.();
        window.location.reload();
      } else {
        setError(data.error ?? 'Failed to assign training.');
      }
    } catch {
      setError('Failed to assign training. Please try again.');
    }
    setSubmitting(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        <UserPlus className="w-3.5 h-3.5" />
        Assign Training
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Assign Training to Staff</h2>
              <button onClick={() => { setOpen(false); reset(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Staff Name *</label>
                  <input
                    type="text"
                    value={form.staffName}
                    onChange={e => field('staffName', e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Staff Email *</label>
                  <input
                    type="email"
                    value={form.staffEmail}
                    onChange={e => field('staffEmail', e.target.value)}
                    placeholder="jane@facility.org"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Training Name *</label>
                <input
                  type="text"
                  value={form.trainingName}
                  onChange={e => field('trainingName', e.target.value)}
                  placeholder="e.g. Annual Fire Safety Training"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => field('category', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => field('expiryDate', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={e => field('department', e.target.value)}
                    placeholder="Nursing"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={e => field('jobTitle', e.target.value)}
                    placeholder="RN"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Assignment</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={e => field('reason', e.target.value)}
                  placeholder="e.g. Policy updated per new CMS requirements"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => field('notes', e.target.value)}
                  placeholder="Additional notes for this assignment"
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isRequired}
                  onChange={e => field('isRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700">Mark as required training</span>
              </label>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
              <button
                onClick={() => { setOpen(false); reset(); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Assigning\u2026' : 'Assign & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
