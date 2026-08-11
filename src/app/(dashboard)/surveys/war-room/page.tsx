'use client';

import { useState, useEffect } from 'react';
import {
  Siren,
  FileSearch,
  Download,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Building2,
  Users,
  Search,
  X,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EscortLog {
  id: string;
  time: string;
  location: string;
  surveyor: string;
  topic: string;
  status: 'compliant' | 'verbal_finding' | 'needs_evidence';
  notes: string;
  escort: string;
}

export default function SurveyWarRoomPage() {
  const [agency, setAgency] = useState('Joint Commission');
  const [surveyType, setSurveyType] = useState('Unannounced Full Triennial');
  const [startTime] = useState('07:15 AM');
  const [elapsedMinutes, setElapsedMinutes] = useState(142);

  // Escort log state
  const [logs, setLogs] = useState<EscortLog[]>([
    {
      id: 'log-1',
      time: '07:30 AM',
      location: 'Patient Unit 1 (Acute Psych)',
      surveyor: 'Dr. R. Miller (TJC Clinical Surveyor)',
      topic: 'Restraint & Seclusion Documentation Audit',
      status: 'compliant',
      notes: 'Reviewed 5 random chart samplings. Order timeliness and face-to-face evaluation logs 100% compliant.',
      escort: 'Sarah Jenkins (CNO)',
    },
    {
      id: 'log-2',
      time: '08:15 AM',
      location: 'Pharmacy & Clean Utility Room',
      surveyor: 'M. Davis (TJC Life Safety Surveyor)',
      topic: 'Medication Storage & Medication Room Temp Logs',
      status: 'needs_evidence',
      notes: 'Requested 30-day temperature logs for double-locked Narcotic Safe B. Evidence pulled from Document Vault.',
      escort: 'Dr. K. Vance (Pharmacy Director)',
    },
    {
      id: 'log-3',
      time: '09:00 AM',
      location: 'Physical Plant & Generator Room',
      surveyor: 'J. Walker (AZ ADHS Safety Inspector)',
      topic: 'Monthly Emergency Generator Load Tests',
      status: 'compliant',
      notes: 'Inspected fuel logs, transfer switch logs, and annual 4-hour load test evidence. Zero findings.',
      escort: 'T. R. Collins (Facilities Director)',
    },
  ]);

  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'compliant' | 'verbal_finding' | 'needs_evidence'>('compliant');

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation || !newTopic) return;

    const log: EscortLog = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: newLocation,
      surveyor: 'Lead Surveyor Team',
      topic: newTopic,
      status: newStatus,
      notes: newNotes || 'Routine observation completed.',
      escort: 'Command Center Escort',
    };

    setLogs([log, ...logs]);
    setNewLocation('');
    setNewTopic('');
    setNewNotes('');
    setIsAddingLog(false);
  };

  const hours = Math.floor(elapsedMinutes / 60);
  const mins = elapsedMinutes % 60;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2">
      {/* Live Survey Emergency Banner */}
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border-2 border-red-500/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-white animate-in fade-in duration-300">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/30 border border-red-400/50 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Siren className="w-7 h-7 text-red-300" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500 text-white shadow-md">
                  Active Survey in Progress
                </span>
                <span className="text-xs text-red-200 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Started today at {startTime} ({hours}h {mins}m active)
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-1">
                {agency} - {surveyType}
              </h1>
              <p className="text-xs text-red-200 mt-1 max-w-2xl">
                War Room Command Center active. Non-essential workflows restricted. Live surveyor tracking, evidence retrieval, and immediate remediation active.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => alert('Surveyor Evidence Pack (PDF/Zip) assembling... Downloading all policies, drill logs, and staff credentials.')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-950 text-xs font-extrabold hover:bg-red-50 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> Download Surveyor Binder Pack
            </button>
            <button
              onClick={() => setIsAddingLog(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold transition-all shadow-lg border border-red-400/40"
            >
              <Plus className="w-4 h-4" /> Log Surveyor Location / Observation
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics & Evidence Vault Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-400" /> Active Tracer Teams
          </p>
          <p className="text-2xl font-black text-foreground">2 Surveyors</p>
          <p className="text-[10px] text-teal-400">Clinical & Life Safety</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Compliant Observations
          </p>
          <p className="text-2xl font-black text-green-400">
            {logs.filter((l) => l.status === 'compliant').length} Areas
          </p>
          <p className="text-[10px] text-muted-foreground">0 Deficiencies Cited</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" /> Evidence Requests
          </p>
          <p className="text-2xl font-black text-amber-400">
            {logs.filter((l) => l.status === 'needs_evidence').length} Active
          </p>
          <p className="text-[10px] text-amber-400 font-medium">Delivered to Command</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Readiness Index
          </p>
          <p className="text-2xl font-black text-cyan-300">98.4%</p>
          <p className="text-[10px] text-cyan-400">Surveyor Binder Prepared</p>
        </div>
      </div>

      {/* Main Grid: Escort Log & Instant Evidence Binder */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Surveyor Escort Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" /> Live Surveyor Tracer & Escort Log
            </h2>
            <span className="text-xs text-muted-foreground">Auto-updating every 30s</span>
          </div>

          {/* Add Log Modal / Form */}
          {isAddingLog && (
            <form onSubmit={handleAddLog} className="bg-card border border-red-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground">Log New Surveyor Observation / Movement</h3>
                <button type="button" onClick={() => setIsAddingLog(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Unit / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 3 West - Nurse Station"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full text-xs p-2.5 bg-muted border border-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Topic / Standard Audited</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ligature Risk & Door Top Sensors"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full text-xs p-2.5 bg-muted border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Status / Finding Level</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-muted border border-border rounded-lg"
                  >
                    <option value="compliant">Compliant / No Citation</option>
                    <option value="needs_evidence">Requested Documents / Evidence</option>
                    <option value="verbal_finding">Verbal Recommendation / Finding</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Observation Notes</label>
                  <input
                    type="text"
                    placeholder="Brief detail of what surveyor inspected..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full text-xs p-2.5 bg-muted border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingLog(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          )}

          {/* Log Items List */}
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  'bg-card border rounded-2xl p-5 space-y-2 transition-all shadow-sm',
                  log.status === 'compliant' && 'border-green-500/30 bg-green-950/10',
                  log.status === 'needs_evidence' && 'border-amber-500/30 bg-amber-950/10',
                  log.status === 'verbal_finding' && 'border-red-500/30 bg-red-950/10'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
                      {log.time}
                    </span>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      {log.location}
                    </h3>
                  </div>

                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                      log.status === 'compliant' && 'bg-green-500/20 text-green-300 border-green-500/30',
                      log.status === 'needs_evidence' && 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                      log.status === 'verbal_finding' && 'bg-red-500/20 text-red-300 border-red-500/30'
                    )}
                  >
                    {log.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs font-semibold text-teal-300">{log.topic}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{log.notes}</p>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2 mt-2">
                  <span>Surveyor: <strong className="text-foreground">{log.surveyor}</strong></span>
                  <span>Escort: <strong className="text-teal-400">{log.escort}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Instant Evidence Vault Packages */}
        <div className="space-y-6">
          <div className="bg-card border border-teal-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                <FileSearch className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Surveyor Evidence Binder</h3>
                <p className="text-xs text-muted-foreground">Instant 1-click audit packets ready for print/export.</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => alert('Downloading TJC CAMH Compliance Package...')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-teal-500/40 hover:bg-teal-950/20 text-left transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-teal-300">
                    Joint Commission CAMH Standard Pack
                  </p>
                  <p className="text-[10px] text-muted-foreground">EM plans, HVA, Restraint logs, QAPI minutes</p>
                </div>
                <Download className="w-4 h-4 text-teal-400 flex-shrink-0" />
              </button>

              <button
                onClick={() => alert('Downloading Arizona ADHS R9-10 Compliance Package...')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-teal-500/40 hover:bg-teal-950/20 text-left transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-teal-300">
                    Arizona ADHS R9-10 State Audit Binder
                  </p>
                  <p className="text-[10px] text-muted-foreground">Title 36 logs, Patient rights, IR/IAD reports</p>
                </div>
                <Download className="w-4 h-4 text-teal-400 flex-shrink-0" />
              </button>

              <button
                onClick={() => alert('Downloading Staff Credentialing Matrix...')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-teal-500/40 hover:bg-teal-950/20 text-left transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-teal-300">
                    Staff Credential & Training Matrix
                  </p>
                  <p className="text-[10px] text-muted-foreground">CPR/CPI certs, licenses, background checks</p>
                </div>
                <Download className="w-4 h-4 text-teal-400 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
