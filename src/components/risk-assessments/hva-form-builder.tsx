'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Trash2, Copy } from 'lucide-react';
import { HVA_TEMPLATES, calculateHVARisk } from '@/lib/hva-templates';

interface HVAEventScore {
  eventId: string;
  eventName: string;
  categoryId: string;
  scores: Record<string, number>;
  notes?: string;
}

interface HVAAssessmentData {
  templateType: 'full-hva' | 'custom' | null;
  selectedCategories: string[];
  events: HVAEventScore[];
}

export function HVAFormBuilder() {
  const [data, setData] = useState<HVAAssessmentData>({
    templateType: null,
    selectedCategories: [],
    events: [],
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const selectTemplate = (type: 'full-hva' | 'custom') => {
    setData(prev => ({
      ...prev,
      templateType: type,
      selectedCategories: type === 'full-hva' ? HVA_TEMPLATES.map(c => c.id) : [],
      events: [],
    }));
  };

  const toggleCategory_Selection = (categoryId: string) => {
    setData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(c => c !== categoryId)
        : [...prev.selectedCategories, categoryId],
      events: prev.events.filter(e => {
        const category = HVA_TEMPLATES.find(c => c.id === categoryId);
        if (!category) return true;
        return !category.events.find(ev => ev.id === e.eventId);
      }),
    }));
  };

  const addEvent = (categoryId: string, eventId: string) => {
    const category = HVA_TEMPLATES.find(c => c.id === categoryId);
    const event = category?.events.find(e => e.id === eventId);
    if (!event) return;

    const newEvent: HVAEventScore = {
      eventId,
      eventName: event.name,
      categoryId,
      scores: {
        probability: 0,
        humanImpact: 0,
        propertyImpact: 0,
        businessImpact: 0,
        preparedness: 0,
        internalResponse: 0,
        externalResponse: 0,
      },
    };

    setData(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
  };

  const updateEventScore = (eventId: string, dimension: string, value: number) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.eventId === eventId ? { ...e, scores: { ...e.scores, [dimension]: value } } : e
      ),
    }));
  };

  const removeEvent = (eventId: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.eventId !== eventId),
    }));
  };

  const duplicateEvent = (eventId: string) => {
    const event = data.events.find(e => e.eventId === eventId);
    if (!event) return;
    setData(prev => ({
      ...prev,
      events: [...prev.events, { ...event }],
    }));
  };

  if (data.templateType === null) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Assessment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => selectTemplate('full-hva')}
              className="p-4 rounded-lg border border-border hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
            >
              <h4 className="font-semibold text-foreground">Full HVA Template</h4>
              <p className="text-xs text-muted-foreground mt-1">6 predefined categories with 80+ events. Includes natural, technological, human, and hazmat hazards.</p>
            </button>
            <button
              onClick={() => selectTemplate('custom')}
              className="p-4 rounded-lg border border-border hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
            >
              <h4 className="font-semibold text-foreground">Custom Assessment</h4>
              <p className="text-xs text-muted-foreground mt-1">Build your own assessment from scratch. Add custom categories and questions.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (data.templateType === 'full-hva') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">HVA Template</h3>
          <button
            onClick={() => setData({ templateType: null, selectedCategories: [], events: [] })}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            Change Method
          </button>
        </div>

        <div className="space-y-3">
          {HVA_TEMPLATES.map(category => (
            <div key={category.id} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedCategories.has(category.id) ? '' : '-rotate-90'}`}
                  />
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${category.color}`}>
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground">({category.events.length} events)</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory_Selection(category.id)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 rounded"
                />
              </button>

              {expandedCategories.has(category.id) && (
                <div className="px-4 py-3 border-t border-border/30 bg-muted/20 space-y-2 max-h-60 overflow-y-auto">
                  {category.events.map(event => (
                    <button
                      key={event.id}
                      onClick={() => addEvent(category.id, event.id)}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors group flex items-center justify-between"
                    >
                      <span className="text-foreground">{event.name}</span>
                      <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-teal-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {data.events.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="text-sm font-semibold text-foreground">Added Events ({data.events.length})</h4>
            {data.events.map((event, idx) => {
              const riskScore = calculateHVARisk(event.scores);
              return (
                <div key={idx} className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{event.eventName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Risk Score: <span className="font-bold text-foreground">{Math.round(riskScore)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateEvent(event.eventId)}
                        className="p-1.5 text-muted-foreground hover:text-teal-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeEvent(event.eventId)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Probability</label>
                      <select
                        value={event.scores.probability}
                        onChange={e => updateEventScore(event.eventId, 'probability', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={0}>N/A</option>
                        <option value={1}>Low</option>
                        <option value={2}>Moderate</option>
                        <option value={3}>High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Human Impact</label>
                      <select
                        value={event.scores.humanImpact}
                        onChange={e => updateEventScore(event.eventId, 'humanImpact', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={0}>No Impact</option>
                        <option value={1}>Little Impact</option>
                        <option value={2}>Some Impact</option>
                        <option value={3}>Significant Impact</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Property Impact</label>
                      <select
                        value={event.scores.propertyImpact}
                        onChange={e => updateEventScore(event.eventId, 'propertyImpact', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={0}>N/A</option>
                        <option value={1}>&lt;$10K</option>
                        <option value={2}>$10-$100K</option>
                        <option value={3}>&gt;$100K</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Business Impact</label>
                      <select
                        value={event.scores.businessImpact}
                        onChange={e => updateEventScore(event.eventId, 'businessImpact', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={0}>N/A</option>
                        <option value={1}>&lt;$10K</option>
                        <option value={2}>$10-$100K</option>
                        <option value={3}>&gt;$100K</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Preparedness</label>
                      <select
                        value={event.scores.preparedness}
                        onChange={e => updateEventScore(event.eventId, 'preparedness', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={0}>N/A</option>
                        <option value={1}>High</option>
                        <option value={2}>Moderate</option>
                        <option value={3}>Low or none</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Internal Response</label>
                      <select
                        value={event.scores.internalResponse}
                        onChange={e => updateEventScore(event.eventId, 'internalResponse', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={0}>N/A</option>
                        <option value={1}>High</option>
                        <option value={2}>Moderate</option>
                        <option value={3}>Low or none</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">External Response</label>
                      <select
                        value={event.scores.externalResponse}
                        onChange={e => updateEventScore(event.eventId, 'externalResponse', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={0}>N/A</option>
                        <option value={1}>High</option>
                        <option value={2}>Moderate</option>
                        <option value={3}>Low or none</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                    <textarea
                      placeholder="Additional notes for this event…"
                      rows={2}
                      className="form-input w-full text-xs resize-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-2 font-medium text-foreground">
        Custom assessment builder
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
          Coming soon
        </span>
      </span>
      <p className="mt-1 text-xs text-muted-foreground">
        Use the standard HVA templates for now. A drag-and-drop custom builder is on the roadmap.
      </p>
    </div>
  );
}
