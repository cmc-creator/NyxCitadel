'use client';

import { useState } from 'react';
import { Mic, Sparkles, CheckCircle2, Loader2, X, AlertTriangle, FileText, Play } from 'lucide-react';

interface VoiceIncidentModalProps {
  onApplyParsedData?: (data: {
    incidentType: string;
    severity: string;
    description: string;
    unit: string;
    dateOccurred: string;
  }) => void;
}

export function VoiceIncidentModal({ onApplyParsedData }: VoiceIncidentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<{
    incidentType: string;
    severity: string;
    description: string;
    unit: string;
    dateOccurred: string;
  } | null>(null);

  const startListening = () => {
    setIsRecording(true);
    setTranscript('');
    setParsedData(null);

    // Simulate voice dictation capture
    setTimeout(() => {
      setTranscript(
        "During shift change at 07:15 in Unit 1 Acute, a Q15 observation check was logged 8 minutes late for Room 102. Assigned floor nurse was managing a de-escalation. No patient injuries, vital signs stable."
      );
      setIsRecording(false);
      handleParseAI(
        "During shift change at 07:15 in Unit 1 Acute, a Q15 observation check was logged 8 minutes late for Room 102. Assigned floor nurse was managing a de-escalation. No patient injuries, vital signs stable."
      );
    }, 2000);
  };

  const handleParseAI = (textToParse: string) => {
    setIsParsing(true);
    setTimeout(() => {
      setParsedData({
        incidentType: 'OBSERVATION_DELAY',
        severity: 'MODERATE',
        description: textToParse,
        unit: 'Unit 1 Acute Psych (Room 102)',
        dateOccurred: new Date().toISOString().split('T')[0],
      });
      setIsParsing(false);
    }, 1000);
  };

  const handleApply = () => {
    if (parsedData && onApplyParsedData) {
      onApplyParsedData(parsedData);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-md border border-teal-400/30"
      >
        <Mic className="w-4 h-4 text-white animate-pulse" />
        <span>🎙️ 30s Voice Dictation (Zero-Work Log)</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card border border-teal-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8 space-y-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-cyan-950 p-4 border-b border-teal-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-teal-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">30-Second Voice Incident Dictation</h3>
                  <p className="text-[10px] text-teal-300">Speak naturally · Sentry AI parses fields automatically</p>
                </div>
              </div>

              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Mic Dictation Trigger Card */}
              <div className="bg-muted/40 border border-border/60 rounded-2xl p-6 text-center space-y-3">
                <button
                  type="button"
                  onClick={startListening}
                  disabled={isRecording || isParsing}
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all shadow-xl ${
                    isRecording
                      ? 'bg-red-500 text-white animate-ping'
                      : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:scale-105'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
                <p className="text-xs font-bold text-foreground">
                  {isRecording ? 'Listening... Speak your incident details now' : 'Tap Microphone to Speak Incident Report'}
                </p>
                <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                  Example: "During shift change at 07:15 in Unit 1, Q15 check was logged 8 minutes late for Room 102..."
                </p>
              </div>

              {/* Speech Transcript Output */}
              {transcript && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">Captured Voice Transcript:</span>
                  <div className="p-3 bg-muted/60 border border-border/60 rounded-xl text-xs text-slate-300 leading-relaxed italic">
                    "{transcript}"
                  </div>
                </div>
              )}

              {/* Parsing Progress */}
              {isParsing && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-teal-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sentry AI extracting incident type, severity, unit, and date...</span>
                </div>
              )}

              {/* Parsed Fields Result */}
              {parsedData && (
                <div className="space-y-3 bg-teal-950/20 border border-teal-500/30 rounded-2xl p-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
                    <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-400" /> Sentry AI Auto-Structured Fields
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      PARSED IN 1.2s
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Incident Type:</span>
                      <span className="font-bold text-white">{parsedData.incidentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Severity Level:</span>
                      <span className="font-bold text-amber-400">{parsedData.severity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location / Unit:</span>
                      <span className="font-bold text-white">{parsedData.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date Occurred:</span>
                      <span className="font-bold text-white">{parsedData.dateOccurred}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApply}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold transition shadow-md mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Apply Parsed Fields to Incident Form
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
