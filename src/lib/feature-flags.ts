'use client';

export interface FeatureFlags {
  sentryAi: boolean;
  vipDemoMode: boolean;
  surveyorDossier: boolean;
  hospitalFloorplan: boolean;
  regulatoryTicker: boolean;
  sentinelCountdown: boolean;
  complianceRoi: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  sentryAi: true,
  vipDemoMode: true,
  surveyorDossier: true,
  hospitalFloorplan: true,
  regulatoryTicker: true,
  sentinelCountdown: true,
  complianceRoi: true,
};

const STORAGE_KEY = 'nyxcitadel:feature-flags:v1';

export function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') return DEFAULT_FEATURE_FLAGS;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_FEATURE_FLAGS;
    return { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_FEATURE_FLAGS;
  }
}

export function setFeatureFlags(flags: Partial<FeatureFlags>): FeatureFlags {
  if (typeof window === 'undefined') return DEFAULT_FEATURE_FLAGS;
  const current = getFeatureFlags();
  const updated = { ...current, ...flags };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('nyx:feature-flags-changed', { detail: updated }));
  return updated;
}
