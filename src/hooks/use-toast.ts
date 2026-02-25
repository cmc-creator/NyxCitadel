'use client';

import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// Simple singleton store for toasts
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...currentToasts]));
}

export function toast({
  title,
  description,
  variant = 'default',
  duration = 4000,
}: {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}) {
  const id = Math.random().toString(36).slice(2);
  const t: Toast = { id, title, description, variant };
  currentToasts = [...currentToasts, t];
  notifyListeners();

  setTimeout(() => {
    currentToasts = currentToasts.filter((x) => x.id !== id);
    notifyListeners();
  }, duration);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts);

  const subscribe = useCallback(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  // Subscribe on mount
  if (typeof window !== 'undefined' && !toastListeners.includes(setToasts)) {
    toastListeners.push(setToasts);
  }

  const dismiss = useCallback((id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return { toasts, dismiss, toast };
}
