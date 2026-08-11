'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { QuickAddUserModal } from '@/components/admin/QuickAddUserModal';

export function QuickAddUserButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-teal-900/30 flex-shrink-0"
      >
        <UserPlus className="w-4 h-4" />
        + Add User & Temp Password
      </button>

      <QuickAddUserModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
