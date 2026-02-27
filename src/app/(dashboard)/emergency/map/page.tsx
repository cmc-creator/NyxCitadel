'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Map,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  ImageOff,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface FloorPlan {
  id: string;
  name: string;
  floor: number;
  imageUrl: string;
  notes?: string | null;
}

export default function FacilityMapPage() {
  const [plans, setPlans]         = useState<FloorPlan[]>([]);
  const [selected, setSelected]   = useState<FloorPlan | null>(null);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');

  // Upload form state
  const [name, setName]   = useState('');
  const [floor, setFloor] = useState('1');
  const [notes, setNotes] = useState('');
  const [file, setFile]   = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await fetch('/api/floor-plans');
      const data = await res.json();
      setPlans(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch {
      setError('Failed to load floor plans.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPlans(); }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('floor', floor);
      fd.append('notes', notes);
      if (file) fd.append('file', file);

      const res = await fetch('/api/floor-plans', { method: 'POST', body: fd });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Upload failed.');
        return;
      }
      const newPlan = await res.json();
      setPlans((prev) => [...prev, newPlan]);
      setSelected(newPlan);
      setName(''); setFloor('1'); setNotes(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
    } catch {
      setError('Network error during upload.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this floor plan?')) return;
    await fetch(`/api/floor-plans?id=${id}`, { method: 'DELETE' });
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    if (selected?.id === id) setSelected(updated[0] ?? null);
  }

  // Group by floor
  const byFloor = plans.reduce<Record<number, FloorPlan[]>>((acc, p) => {
    acc[p.floor] = [...(acc[p.floor] ?? []), p];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-600" />
            Facility Map — Digital Twin
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload floor plans and zone maps for emergency overlay and drill activation.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Upload Floor Plan
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <h3 className="font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Add New Floor Plan
          </h3>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-3">{error}</p>
          )}
          <form onSubmit={handleUpload} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Unit 2 North Wing"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Floor / Level</label>
              <input
                type="number"
                min={1}
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Image File (PNG, JPG, PDF)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional description"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="col-span-full flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading…' : 'Save Floor Plan'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-5">
        {/* Sidebar — Floor List */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Floor Plans</h3>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No floor plans uploaded yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-2 text-xs text-indigo-600 hover:underline">
                Upload one now
              </button>
            </div>
          ) : (
            Object.entries(byFloor)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([floorNum, fps]) => (
                <div key={floorNum}>
                  <p className="text-xs font-medium text-slate-400 mb-1">Floor {floorNum}</p>
                  {fps.map((fp) => (
                    <div
                      key={fp.id}
                      onClick={() => setSelected(fp)}
                      className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${selected?.id === fp.id ? 'bg-indigo-100 border border-indigo-300' : 'hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Map className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-sm text-slate-700 truncate">{fp.name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(fp.id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ))
          )}
        </div>

        {/* Main — Floor Plan Viewer */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {selected ? (
            <>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{selected.name}</p>
                  <p className="text-xs text-slate-400">Floor {selected.floor}{selected.notes ? ` · ${selected.notes}` : ''}</p>
                </div>
                <div className="flex gap-1">
                  {/* Prev / next */}
                  {plans.length > 1 && (
                    <>
                      <button
                        onClick={() => {
                          const idx = plans.findIndex((p) => p.id === selected.id);
                          setSelected(plans[(idx - 1 + plans.length) % plans.length]);
                        }}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const idx = plans.findIndex((p) => p.id === selected.id);
                          setSelected(plans[(idx + 1) % plans.length]);
                        }}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 min-h-[500px] flex items-center justify-center">
                {selected.imageUrl && selected.imageUrl !== '/images/placeholder-floorplan.svg' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.imageUrl}
                    alt={selected.name}
                    className="max-w-full max-h-[600px] object-contain rounded-lg shadow"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No image uploaded for this floor plan.</p>
                    <p className="text-xs mt-1">Delete and re-upload with an image file.</p>
                  </div>
                )}
              </div>
              {/* Emergency Zone Legend */}
              <div className="px-4 py-3 border-t border-slate-100 bg-white">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Emergency Zone Legend</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Evacuation Route',    color: 'bg-green-500'  },
                    { label: 'Fire Extinguisher',   color: 'bg-red-500'    },
                    { label: 'AED Location',        color: 'bg-yellow-500' },
                    { label: 'Shelter Zone',        color: 'bg-blue-500'   },
                    { label: 'Hazmat Area',         color: 'bg-orange-500' },
                    { label: 'Command Post',        color: 'bg-purple-500' },
                  ].map((z) => (
                    <div key={z.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${z.color}`} />
                      <span className="text-xs text-slate-600">{z.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Interactive overlay coming in a future update. For now, annotations can be made on the uploaded image.
                </p>
              </div>
            </>
          ) : (
            <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-400 gap-3">
              <Map className="w-12 h-12 opacity-20" />
              <p className="text-sm">Select a floor plan from the list, or upload one to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-indigo-600 hover:underline"
              >
                Upload Floor Plan →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Link */}
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>Use during drills:</span>
        <Link href="/emergency/drills" className="text-indigo-600 hover:underline">
          Drills & Exercises →
        </Link>
      </div>
    </div>
  );
}
