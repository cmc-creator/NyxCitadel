'use client';

import { useEffect, useState } from 'react';
import { Mail, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type FacilityList = {
  facilityId: string;
  facilityName: string;
  emails: string[];
  frequency: 'disabled' | 'daily' | 'weekly' | 'both';
};

export function ExportDeliveryListCard() {
  const [facilities, setFacilities] = useState<FacilityList[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/export-delivery-list');
        if (!res.ok) return;
        const data = (await res.json()) as { facilities: FacilityList[] };
        setFacilities(data.facilities);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function saveRow(facilityId: string, rawValue: string, frequency: FacilityList['frequency']) {
    setSavingId(facilityId);
    const emails = rawValue
      .split(/[,\n;]/)
      .map((value) => value.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/export-delivery-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, emails, frequency }),
      });
      if (!res.ok) throw new Error('Failed to save delivery list');
      const data = (await res.json()) as { facilityId: string; emails: string[]; frequency: FacilityList['frequency'] };
      setFacilities((prev) => prev.map((facility) => facility.facilityId === data.facilityId ? { ...facility, emails: data.emails, frequency: data.frequency } : facility));
      toast({ title: 'Delivery List Saved', description: 'Scheduled export recipients and cadence updated.' });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Could not update delivery list.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-teal-400" />
        <h3 className="text-sm font-semibold text-foreground">Export Delivery Lists</h3>
      </div>
      <p className="text-xs text-muted-foreground">Add executive recipients who should receive scheduled export packages even if they do not have platform logins.</p>

      {loading && <p className="text-xs text-muted-foreground">Loading delivery lists...</p>}

      {!loading && facilities.length === 0 && <p className="text-xs text-muted-foreground">No facilities available.</p>}

      <div className="space-y-3">
        {facilities.map((facility) => {
          const currentValue = facility.emails.join(', ');
          return (
            <FacilityDeliveryRow
              key={facility.facilityId}
              facility={facility}
              initialValue={currentValue}
              initialFrequency={facility.frequency}
              saving={savingId === facility.facilityId}
              onSave={saveRow}
            />
          );
        })}
      </div>
    </div>
  );
}

function FacilityDeliveryRow({
  facility,
  initialValue,
  initialFrequency,
  saving,
  onSave,
}: {
  facility: FacilityList;
  initialValue: string;
  initialFrequency: FacilityList['frequency'];
  saving: boolean;
  onSave: (facilityId: string, rawValue: string, frequency: FacilityList['frequency']) => Promise<void>;
}) {
  const [value, setValue] = useState(initialValue);
  const [frequency, setFrequency] = useState(initialFrequency);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setFrequency(initialFrequency);
  }, [initialFrequency]);

  return (
    <div className="rounded-lg border border-border/60 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{facility.facilityName}</p>
        <div className="flex items-center gap-2">
          <select
            title={`Export cadence for ${facility.facilityName}`}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as FacilityList['frequency'])}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
          >
            <option value="disabled">Disabled</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="both">Daily + Weekly</option>
          </select>
          <button
            onClick={() => void onSave(facility.facilityId, value, frequency)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-medium"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        placeholder="ceo@facility.com, boardchair@facility.com"
      />
      <p className="text-[11px] text-muted-foreground">Comma, semicolon, or newline separated email addresses. Use the cadence selector to control whether external recipients receive daily, weekly, both, or no scheduled summaries.</p>
    </div>
  );
}
