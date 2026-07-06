'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

/** Fire a toast from anywhere: toast('Saved!', 'success') */
export function toast(message: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('medibook:toast', { detail: { message, type } })
  );
}

const config = {
  success: { icon: CheckCircle2, accent: 'var(--success)' },
  error: { icon: XCircle, accent: 'var(--destructive)' },
  info: { icon: Info, accent: 'var(--primary)' },
} as const;

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let counter = 0;
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail as {
        message: string;
        type: ToastType;
      };
      const id = ++counter;
      setItems((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    };
    window.addEventListener('medibook:toast', handler);
    return () => window.removeEventListener('medibook:toast', handler);
  }, []);

  const dismiss = (id: number) =>
    setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[min(92vw,22rem)]">
      {items.map((t) => {
        const { icon: Icon, accent } = config[t.type];
        return (
          <div
            key={t.id}
            role="status"
            className="animate-toast glass rounded-2xl shadow-[var(--shadow-lg)] p-4 flex items-start gap-3 overflow-hidden relative"
          >
            <span
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: accent }}
            />
            <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
            <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors rounded-md p-0.5"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
