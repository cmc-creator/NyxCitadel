'use client';

import { type ReactNode } from 'react';

interface PrintButtonProps {
  children: ReactNode;
  className?: string;
}

export function PrintButton({ children, className }: PrintButtonProps) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {children}
    </button>
  );
}
