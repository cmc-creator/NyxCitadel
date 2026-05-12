'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  UserCircle, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, X, LogOut, Phone,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const DEPARTMENTS = [
  'Administration',
  'Executive',
  'Nursing',
  'Social Services',
  'Human Resources',
  'Culinary / Food Services',
  'Plant Operations',
  'Environmental Services (EVS)',
  'Pharmacy',
  'Quality / QAPI',
  'Risk Management',
  'Compliance',
  'Infection Control',
  'Emergency Management',
  'Medical Staff',
  'Case Management',
  'Radiology',
  'Laboratory',
  'Respiratory Therapy',
  'Physical / Occupational Therapy',
  'Behavioral Health',
  'Security',
  'Finance',
  'IT / Health Informatics',
  'Other',
];

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  title: string | null;
  department: string | null;
  phone: string | null;
  smsEnabled: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN:       'Super Admin',
  ADMIN:             'Administrator',
  COMPLIANCE_OFFICER:'Compliance Officer',
  RISK_MANAGER:      'Risk Manager',
  EM_COORDINATOR:    'EM Coordinator',
  QUALITY:           'Quality / PI Staff',
  EDUCATION:         'Staff Education',
  STAFF:             'General Staff',
  READ_ONLY:         'Read Only',
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [flash, setFlash]       = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const [form, setForm] = useState({
    name: '', title: '', department: '', password: '', confirmPassword: '', phone: '', smsEnabled: false,
  });

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) return;
      const data = await res.json() as ProfileData;
      setProfile(data);
      setForm(f => ({
        ...f,
        name:       data.name ?? '',
        title:      data.title ?? '',
        department: data.department ?? '',
        phone:      data.phone ?? '',
        smsEnabled: data.smsEnabled,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) void load(userId);
  }, [userId, load]);

  async function save() {
    if (!userId) return;
    if (form.password && form.password !== form.confirmPassword) {
      setFlash({ type: 'err', msg: 'Passwords do not match.' });
      return;
    }
    setSaving(true);
    setFlash(null);
    try {
      const body: Record<string, unknown> = {
        name:       form.name,
        title:      form.title,
        department: form.department,
        phone:      form.phone || null,
        smsEnabled: form.smsEnabled,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setFlash({ type: 'err', msg: d.error ?? 'Save failed.' });
        return;
      }

      const updated = await res.json() as ProfileData;
      setProfile(updated);
      setForm(f => ({ ...f, password: '', confirmPassword: '', phone: updated.phone ?? '', smsEnabled: updated.smsEnabled }));
      setFlash({ type: 'ok', msg: 'Profile updated. Sign out and back in if you changed your department to refresh the dashboard panel.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground/70 text-sm py-10 px-6">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading profile&hellip;
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-teal-800/40 border border-teal-600/30 flex items-center justify-center flex-shrink-0">
          <UserCircle className="w-8 h-8 text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{profile.name ?? profile.email}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
            {ROLE_LABELS[profile.role] ?? profile.role}
          </span>
        </div>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm font-medium ${flash.type === 'ok' ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
          {flash.type === 'ok' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <span className="flex-1">{flash.msg}</span>
          <button onClick={() => setFlash(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-foreground">Profile Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Full Name</label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Email</label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground cursor-not-allowed"
              value={profile.email}
              disabled
              title="Contact an administrator to change your email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Job Title</label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Director of Quality"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Department</label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            >
              <option value="">&#8212; Select department &#8212;</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <p className="text-xs text-muted-foreground/60 mt-1">Setting your department personalizes the dashboard quick-start panel.</p>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* SMS Alerts */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">SMS Alerts</h2>
        <p className="text-xs text-muted-foreground/70">
          Receive a text message when new compliance alerts are generated. Requires Twilio to be configured by your administrator.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Mobile Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                className="w-full border border-border rounded-lg pl-9 pr-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
                type="tel"
              />
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1">Include country code, e.g. +1 for US.</p>
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setForm(f => ({ ...f, smsEnabled: !f.smsEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.smsEnabled ? 'bg-teal-600' : 'bg-border'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.smsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                {form.smsEnabled ? 'SMS alerts enabled' : 'SMS alerts disabled'}
              </span>
            </label>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save SMS Settings
        </button>
      </div>

      {/* Password Change */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Change Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="New password (min 8 chars)"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground/80">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Confirm Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Repeat new password"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60">Leave both fields blank to keep your current password.</p>
      </div>

      {/* Sign out */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Sign out</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Ends your current session on this device.</p>
        </div>
        <button
          onClick={() => void signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 border border-red-800/40 hover:border-red-700/60 px-4 py-2 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
