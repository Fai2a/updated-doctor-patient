'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    if (Array.isArray(data)) setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAll = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    await Promise.all(ids.map((id) => fetch(`/api/notifications/${id}`, { method: 'PATCH' })));
  };

  const count = notifications.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative w-10 h-10 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 flex">
            <span className="absolute inline-flex h-4 w-4 rounded-full bg-destructive/60 animate-ping" />
            <span className="relative inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-bold ring-2 ring-card">
              {count > 9 ? '9+' : count}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass rounded-2xl shadow-[var(--shadow-lg)] z-50 animate-scale-in origin-top-right overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {count > 0 ? `${count} unread` : 'You’re all caught up'}
              </p>
            </div>
            {count > 0 && (
              <button
                onClick={markAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {count === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-secondary grid place-items-center">
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                </span>
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 border-b border-border/60 last:border-0 hover:bg-secondary/50 transition-colors group flex items-start gap-3"
                >
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{n.message}</p>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all shrink-0"
                    aria-label="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
