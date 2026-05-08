'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldOff, Copy, CheckCircle2, KeyRound, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Step = 'idle' | 'qr' | 'verify' | 'backup' | 'disable';

export default function SecuritySettingsPage() {
  const [step, setStep] = useState<Step>('idle');
  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpInput, setTotpInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/settings/2fa/status')
      .then(r => r.json())
      .then((d: { enabled: boolean }) => setTotpEnabled(d.enabled))
      .catch(() => setTotpEnabled(false));
  }, []);

  async function startSetup() {
    setWorking(true); setError('');
    try {
      const res = await fetch('/api/settings/2fa/setup', { method: 'POST' });
      const data = await res.json() as { qrDataUrl?: string; secret?: string; backupCodes?: string[]; error?: string };
      if (!res.ok) { setError(data.error ?? 'Setup failed.'); return; }
      setQrDataUrl(data.qrDataUrl ?? '');
      setSecret(data.secret ?? '');
      setBackupCodes(data.backupCodes ?? []);
      setStep('qr');
    } finally { setWorking(false); }
  }

  async function verifyToken() {
    setWorking(true); setError('');
    try {
      const res = await fetch('/api/settings/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: totpInput.trim(), backupCodes }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? 'Verification failed.'); return; }
      setStep('backup');
      setTotpEnabled(true);
    } finally { setWorking(false); }
  }

  async function disable2FA() {
    setWorking(true); setError('');
    try {
      const res = await fetch('/api/settings/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to disable 2FA.'); return; }
      setTotpEnabled(false);
      setStep('idle');
      setPasswordInput('');
    } finally { setWorking(false); }
  }

  function copyBackup() {
    navigator.clipboard.writeText(backupCodes.join('\n')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/settings" className="text-sm text-muted-foreground/70 hover:text-foreground">&larr; Settings</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-teal-600" />
          Account Security
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage two-factor authentication (2FA) for your account.</p>
      </div>

      {/* Status card */}
      <div className={`rounded-xl border p-5 flex items-start gap-4 ${totpEnabled ? 'bg-green-950/20 border-green-200' : 'bg-card border-border'}`}>
        {totpEnabled
          ? <ShieldCheck className="w-7 h-7 text-green-600 shrink-0 mt-0.5" />
          : <ShieldOff className="w-7 h-7 text-slate-400 shrink-0 mt-0.5" />
        }
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            Two-Factor Authentication is {totpEnabled ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totpEnabled
              ? 'Your account is protected. You will be asked for a code each time you sign in.'
              : 'Add an extra layer of security using an authenticator app (Google Authenticator, Authy, etc.).'}
          </p>
        </div>
        {totpEnabled === false && step === 'idle' && (
          <button onClick={startSetup} disabled={working} className="shrink-0 text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            Enable 2FA
          </button>
        )}
        {totpEnabled && step === 'idle' && (
          <button onClick={() => setStep('disable')} className="shrink-0 text-sm bg-red-600/10 hover:bg-red-600/20 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-medium">
            Disable
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step: Show QR code */}
      {step === 'qr' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2"><KeyRound className="w-4 h-4 text-teal-600" /> Step 1: Scan QR Code</h2>
            <p className="text-sm text-muted-foreground mt-1">Open your authenticator app and scan this code, or enter the secret key manually.</p>
          </div>
          <div className="flex justify-center">
            {qrDataUrl && <Image src={qrDataUrl} alt="QR Code" width={180} height={180} className="rounded-lg border border-border" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Manual entry key</p>
            <div className="bg-muted/30 border border-border rounded-lg px-3 py-2 font-mono text-sm text-foreground tracking-widest break-all">{secret}</div>
          </div>
          <button onClick={() => setStep('verify')} className="w-full text-sm bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium">
            I&apos;ve scanned it &rarr;
          </button>
        </div>
      )}

      {/* Step: Verify token */}
      {step === 'verify' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2"><KeyRound className="w-4 h-4 text-teal-600" /> Step 2: Verify Code</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code shown in your authenticator app to confirm setup.</p>
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={totpInput}
            onChange={e => setTotpInput(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center text-2xl font-mono tracking-[0.5em] border border-border rounded-lg px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
          />
          <div className="flex gap-3">
            <button onClick={() => setStep('qr')} className="flex-1 text-sm border border-border text-muted-foreground hover:bg-accent py-2.5 rounded-lg font-medium">Back</button>
            <button onClick={verifyToken} disabled={working || totpInput.length !== 6} className="flex-1 text-sm bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
              {working ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Backup codes */}
      {step === 'backup' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-green-400">2FA Enabled Successfully!</h2>
              <p className="text-sm text-muted-foreground mt-1">Save these backup codes in a safe place. Each code can only be used once if you lose access to your authenticator app.</p>
            </div>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm grid grid-cols-2 gap-2">
            {backupCodes.map(code => (
              <div key={code} className="text-foreground/80 tracking-wider">{code}</div>
            ))}
          </div>
          <button onClick={copyBackup} className="w-full flex items-center justify-center gap-2 text-sm border border-border text-muted-foreground hover:bg-accent py-2.5 rounded-lg font-medium">
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy backup codes'}
          </button>
          <button onClick={() => setStep('idle')} className="w-full text-sm bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium">
            Done
          </button>
        </div>
      )}

      {/* Step: Disable 2FA */}
      {step === 'disable' && (
        <div className="bg-card border border-red-200 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2"><ShieldOff className="w-4 h-4 text-red-600" /> Disable Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your current password to confirm you want to remove 2FA protection from your account.</p>
          </div>
          <input
            type="password"
            placeholder="Current password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400"
          />
          <div className="flex gap-3">
            <button onClick={() => { setStep('idle'); setError(''); }} className="flex-1 text-sm border border-border text-muted-foreground hover:bg-accent py-2.5 rounded-lg font-medium">Cancel</button>
            <button onClick={disable2FA} disabled={working || !passwordInput} className="flex-1 text-sm bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
              {working ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
