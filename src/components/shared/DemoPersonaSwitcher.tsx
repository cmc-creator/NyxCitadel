'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Crown, ShieldCheck, ClipboardCheck, Users } from 'lucide-react';
import { startGeniusTour } from '@/components/onboarding/GeniusWalkthrough';

export const HOSPITAL_ROLES = [
  { id: 'executive' as const, label: 'Executive Leadership (CEO / Board)', icon: Crown },
  { id: 'risk_manager' as const, label: 'Risk & Patient Safety Manager', icon: ShieldCheck },
  { id: 'compliance' as const, label: 'Quality & Compliance Officer', icon: ClipboardCheck },
  { id: 'staff' as const, label: 'Clinical & Department Staff', icon: Users },
];

export function DemoPersonaSwitcher() {
  const [selectedRole, setSelectedRole] = useState<'executive' | 'risk_manager' | 'compliance' | 'staff'>('executive');

  useEffect(() => {
    const saved = window.localStorage.getItem('nyxcitadel:demo-persona:v1') as any;
    if (saved && ['executive', 'risk_manager', 'compliance', 'staff'].includes(saved)) {
      setSelectedRole(saved);
    }
  }, []);

  const handleSelectRole = (roleId: 'executive' | 'risk_manager' | 'compliance' | 'staff') => {
    setSelectedRole(roleId);
    window.localStorage.setItem('nyxcitadel:demo-persona:v1', roleId);
    startGeniusTour(roleId);
  };

  const activeRole = HOSPITAL_ROLES.find((r) => r.id === selectedRole) || HOSPITAL_ROLES[0];
  const Icon = activeRole.icon;

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs text-amber-200">
        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] uppercase font-bold text-amber-400/80">Role:</span>
        <select
          value={selectedRole}
          onChange={(e) => handleSelectRole(e.target.value as any)}
          className="bg-transparent text-amber-200 font-bold text-xs focus:outline-none cursor-pointer"
        >
          {HOSPITAL_ROLES.map((role) => (
            <option key={role.id} value={role.id} className="bg-slate-900 text-slate-100">
              {role.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
