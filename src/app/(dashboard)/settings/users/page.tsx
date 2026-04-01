'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, PencilLine, ShieldOff, ShieldCheck,
  Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, X,
} from 'lucide-react';

interface AppUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  title: string | null;
  department: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLES = [
  { value: 'ADMIN',               label: 'Administrator' },
  { value: 'COMPLIANCE_OFFICER',  label: 'Compliance Officer' },
  { value: 'RISK_MANAGER',        label: 'Risk Manager' },
  { value: 'EM_COORDINATOR',      label: 'EM Coordinator' },
  { value: 'QUALITY',             label: 'Quality / PI Staff' },
  { value: 'EDUCATION',           label: 'Staff Education' },
  { value: 'STAFF',               label: 'General Staff' },
  { value: 'READ_ONLY',           label: 'Read Only' },
];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:       'bg-red-100    text-red-800',
  ADMIN:             'bg-teal-100 text-teal-800',
  COMPLIANCE_OFFICER:'bg-blue-100   text-blue-800',
  RISK_MANAGER:      'bg-orange-100 text-orange-800',
  EM_COORDINATOR:    'bg-teal-100   text-teal-800',
  QUALITY:           'bg-green-100  text-green-800',
  EDUCATION:         'bg-yellow-100 text-yellow-800',
  STAFF:             'bg-slate-100  text-slate-700',
  READ_ONLY:         'bg-gray-100   text-gray-600',
};

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'STAFF', title: '', department: '',
};

function fmtDate(s: string | null) {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UsersSettingsPage() {
  const [users, setUsers]           = useState<AppUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [editUser, setEditUser]     = useState<AppUser | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [showPw, setShowPw]         = useState(false);
  const [saving, setSaving]         = useState(false);
  const [flash, setFlash]           = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) { setError('Failed to load users.'); return; }
      setUsers(await res.json() as AppUser[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openNew() {
    setEditUser(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function openEdit(u: AppUser) {
    setEditUser(u);
    setForm({ name: u.name ?? '', email: u.email, password: '', role: u.role, title: u.title ?? '', department: u.department ?? '' });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    setFlash(null);
    try {
      let res: Response;
      if (editUser) {
        const body: Record<string, string> = { name: form.name, email: form.email, role: form.role, title: form.title, department: form.department };
        if (form.password) body.password = form.password;
        res = await fetch(`/api/users/${editUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      }
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setFlash({ type: 'err', msg: d.error ?? 'Save failed.' });
        return;
      }
      setFlash({ type: 'ok', msg: editUser ? 'User updated.' : 'User created successfully.' });
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: AppUser) {
    const method = u.isActive ? 'DELETE' : 'PATCH';
    const body   = u.isActive ? undefined : JSON.stringify({ isActive: true });
    const headers = u.isActive ? undefined : { 'Content-Type': 'application/json' };
    await fetch(`/api/users/${u.id}`, { method, body, headers });
    await load();
  }

  const active   = users.filter(u => u.isActive);
  const inactive = users.filter(u => !u.isActive);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage staff accounts and role-based access for your facility.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${flash.type === 'ok' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {flash.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {flash.msg}
          <button onClick={() => setFlash(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">{editUser ? `Edit ${editUser.name ?? editUser.email}` : 'Add New User'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                type="email"
                placeholder="jane@hospital.org"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {editUser ? 'New Password (leave blank to keep current)' : 'Password *'}
              </label>
              <div className="relative">
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role *</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Compliance Officer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Risk Management" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {editUser ? 'Save Changes' : 'Create User'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Active Users Table */}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading users…
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Active Staff ({active.length})</h2>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 w-1/3">Name / Email</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Role</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Department</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Last Login</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Since</th>
                    <th className="px-4 py-3 w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {active.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-slate-400 text-sm py-6">No active users.</td></tr>
                  )}
                  {active.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{u.name ?? '-'}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                        {u.title && <p className="text-xs text-slate-500 mt-0.5">{u.title}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-700'}`}>
                          {ROLES.find(r => r.value === u.role)?.label ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{u.department ?? '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(u.lastLoginAt)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-teal-700 transition" title="Edit">
                            <PencilLine className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => void toggleActive(u)} className="p-1.5 rounded hover:bg-red-100 text-slate-500 hover:text-red-700 transition" title="Deactivate">
                            <ShieldOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {inactive.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 mb-3">Inactive / Deactivated ({inactive.length})</h2>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden opacity-70">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3 w-1/3">Name / Email</th>
                      <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3">Role</th>
                      <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3">Department</th>
                      <th className="px-4 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {inactive.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-500">{u.name ?? '-'}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            {ROLES.find(r => r.value === u.role)?.label ?? u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{u.department ?? '-'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => void toggleActive(u)} className="p-1.5 rounded hover:bg-green-100 text-slate-400 hover:text-green-700 transition" title="Reactivate">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
