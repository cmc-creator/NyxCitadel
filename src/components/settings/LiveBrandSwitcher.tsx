'use client';

import { useState, useEffect } from 'react';
import { Building2, Palette, Check, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BrandPreset {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  accentColor: string;
  badge: string;
  state: string;
}

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'destiny-springs',
    name: 'Destiny Springs Healthcare',
    shortName: 'Destiny Springs',
    primaryColor: '#0d9488', // teal-600
    accentColor: '#06b6d4',  // cyan-500
    badge: 'Acute Psychiatric',
    state: 'Peoria, AZ',
  },
  {
    id: 'banner-health',
    name: 'Banner Behavioral Health System',
    shortName: 'Banner Health',
    primaryColor: '#2563eb', // blue-600
    accentColor: '#38bdf8',  // sky-400
    badge: 'Health System',
    state: 'Phoenix, AZ',
  },
  {
    id: 'honor-health',
    name: 'HonorHealth Medical Center',
    shortName: 'HonorHealth',
    primaryColor: '#7c3aed', // violet-600
    accentColor: '#a855f7',  // purple-500
    badge: 'Medical Center',
    state: 'Scottsdale, AZ',
  },
  {
    id: 'mayo-clinic',
    name: 'Mayo Clinic Health System',
    shortName: 'Mayo Clinic',
    primaryColor: '#0284c7', // sky-600
    accentColor: '#10b981',  // emerald-500
    badge: 'Enterprise',
    state: 'Phoenix, AZ',
  },
];

export function LiveBrandSwitcherModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedId, setSelectedId] = useState('destiny-springs');

  useEffect(() => {
    const saved = window.localStorage.getItem('nyxcitadel:selected-brand') || 'destiny-springs';
    setSelectedId(saved);
  }, []);

  const handleSelect = (brand: BrandPreset) => {
    setSelectedId(brand.id);
    window.localStorage.setItem('nyxcitadel:selected-brand', brand.id);
    document.documentElement.setAttribute('data-facility', brand.id);
    window.dispatchEvent(new CustomEvent('nyx:brand-changed', { detail: brand }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">White-Label Brand Switcher</h3>
              <p className="text-xs text-muted-foreground">Preview tenant-specific branding in real-time.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {BRAND_PRESETS.map((brand) => {
            const isSelected = selectedId === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => handleSelect(brand)}
                className={cn(
                  'w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'border-teal-500/50 bg-teal-950/20 shadow-md ring-1 ring-teal-500/30'
                    : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 border border-white/20 shadow-sm"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">
                      {brand.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <span>{brand.state}</span> •{' '}
                      <span className="text-teal-400 font-medium">{brand.badge}</span>
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Apply Branding
          </button>
        </div>
      </div>
    </div>
  );
}
