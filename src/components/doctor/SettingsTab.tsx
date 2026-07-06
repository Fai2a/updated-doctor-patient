'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, Calendar as CalendarIcon, Loader2, CalendarPlus, CheckCircle2 } from 'lucide-react';
import { toast } from '../shared/Toast';

const timeSlots = [
  '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00',
  '11:00 - 11:30', '11:30 - 12:00', '14:00 - 14:30', '14:30 - 15:00',
  '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00',
];

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export default function SettingsTab() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split('T')[0],
    time: timeSlots[0],
  });

  const fetchSlots = async () => {
    const res = await fetch('/api/doctor/availability');
    const data = await res.json();
    if (Array.isArray(data)) setSlots(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const [startTime, endTime] = newSlot.time.split(' - ');
    const res = await fetch('/api/doctor/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newSlot.date, startTime, endTime }),
    });
    setSaving(false);
    if (res.ok) {
      toast('Availability slot added', 'success');
      fetchSlots();
    } else {
      toast('Could not add this slot', 'error');
    }
  };

  const available = slots.filter((s) => !s.isBooked).length;

  return (
    <div className="grid lg:grid-cols-5 gap-6 animate-slide-up">
      {/* Add form */}
      <div className="lg:col-span-2">
        <div className="card-surface p-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl brand-gradient grid place-items-center text-white">
              <CalendarPlus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold">Add availability</h3>
              <p className="text-xs text-muted-foreground">Open a new slot for patients</p>
            </div>
          </div>

          <form onSubmit={handleAddSlot} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  className="w-full pl-11 pr-3 py-3 rounded-xl border border-border bg-background outline-none transition-all"
                  value={newSlot.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Time slot</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <select
                  className="w-full pl-11 pr-3 py-3 rounded-xl border border-border bg-background outline-none transition-all appearance-none"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  required
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full brand-gradient text-white py-3 rounded-xl font-bold shadow-[var(--shadow-glow)] hover:brightness-105 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Add slot
            </button>
          </form>
        </div>
      </div>

      {/* Current slots */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Your slots</h3>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
            {available} available · {slots.length} total
          </span>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="card-surface border-dashed p-12 flex flex-col items-center text-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-secondary grid place-items-center">
              <CalendarIcon className="w-7 h-7 text-muted-foreground" />
            </span>
            <p className="font-semibold">No slots yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add your first availability slot so patients can book with you.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 stagger">
            {slots.map((s) => (
              <div
                key={s.id}
                className="card-surface p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                      s.isBooked
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                    }`}
                  >
                    {s.isBooked ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {new Date(s.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.startTime} – {s.endTime}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${
                    s.isBooked
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                  }`}
                >
                  {s.isBooked ? 'Booked' : 'Open'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
