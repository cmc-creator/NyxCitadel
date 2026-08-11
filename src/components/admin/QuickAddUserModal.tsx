'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  X,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  KeyRound,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLES = [
  { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
  { value: 'RISK_MANAGER',       label: 'Risk Manager' },
  { value: 'ADMIN',              label: 'Administrator' },
  { value: 'EM_COORDINATOR',     label: 'EM Coordinator' },
  { value: 'QUALITY',            label: 'Quality / PI Staff' },
  { value: 'EDUCATION',          label: 'Staff Education' },
  { value: 'STAFF',              label: 'General Staff' },
  { value: 'READ_ONLY',          label: 'Read Only' },
];

const DEPARTMENTS = [
  'Executive',
  'Administration',
  'Nursing',
  'Pharmacy',
  'Quality / QAPI',
  'Risk Management',
  'Compliance',
  'Infection Control',
  'Social Services',
  'Human Resources',
  'Plant Operations / EOC',
  'Emergency Management',
  'Medical Staff',
  'Security',
];

export function QuickAddUserModal({ isOpen, onClose, onSuccess }: QuickAddUserModalProps) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('COMPLIANCE_OFFICER');
  const [department, setDepartment] = useState('Compliance');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdInfo, setCreatedInfo] = useState<{ email: string; pass: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const tempPass = `Nyx#${rand}!`;
    setPassword(tempPass);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and temporary password are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim(),
          password: password.trim(),
          role,
          department,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create user.');
        return;
      }

      setCreatedInfo({ email: email.trim(), pass: password.trim(), name: name.trim() || email.trim() });
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      setError('An error occurred while creating the user.');
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = () => {
    if (!createdInfo) return;
    const text = `Welcome to NyxCitadel! Your staff compliance account has been created.\n\nLogin URL: ${window.location.origin}/login\nEmail: ${createdInfo.email}\nTemp Password: ${createdInfo.pass}\n\nPlease log in and change your password upon initial sign-in.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setCreatedInfo(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-teal-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Add User & Temp Password</h2>
              <p className="text-xs text-muted-foreground">Create staff accounts instantly from your admin panel.</p>
            </div>
          </div>
          <button onClick={handleReset} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success view if created */}
        {createdInfo ? (
          <div className="space-y-4 py-2 animate-in fade-in duration-300">
            <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
              <h3 className="text-base font-bold text-green-300">User Created Successfully!</h3>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{createdInfo.name}</strong> ({createdInfo.email}) has been added to your facility.
              </p>
            </div>

            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-400" /> Temporary Login Credentials:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-background p-3 rounded-lg border border-border/60">
                <div>
                  <span className="text-muted-foreground text-[10px] block font-sans">EMAIL</span>
                  <span className="text-foreground font-semibold">{createdInfo.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block font-sans">TEMP PASSWORD</span>
                  <span className="text-teal-400 font-bold">{createdInfo.pass}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={copyCredentials}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md mt-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" /> Invite Snippet Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Login Invite to Clipboard
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCreatedInfo(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted"
              >
                Add Another User
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form view */
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs p-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Temp Password Row */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Temporary Password <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateTempPassword}
                  className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Generate Temp Password
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Enter temp password or click Generate above..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-2.5 bg-muted border border-border rounded-xl pr-10 font-mono text-teal-300 focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">The user will log in with this temporary password.</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !email || !password}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create User Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
