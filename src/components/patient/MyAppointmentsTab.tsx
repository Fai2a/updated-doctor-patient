'use client';

import { useState, useEffect } from 'react';
import { StatusBadge } from '../shared/StatusBadge';
import { CardSkeleton } from '../shared/Skeleton';
import { toast } from '../shared/Toast';
import { Calendar, Clock, Trash2, Stethoscope, CalendarHeart, Loader2 } from 'lucide-react';

interface Appt {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  concern: string;
  doctor: { name: string };
  slot: { date: string; startTime: string; endTime: string };
}

export default function MyAppointmentsTab() {
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchAppointments = async () => {
    const res = await fetch('/api/patient/appointments');
    const data = await res.json();
    if (Array.isArray(data)) setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    setBusy(id);
    const res = await fetch(`/api/patient/appointments/${id}`, { method: 'DELETE' });
    setBusy(null);
    setConfirmId(null);
    if (res.ok) {
      toast('Appointment cancelled', 'info');
      fetchAppointments();
    } else {
      const data = await res.json();
      toast(data.error || 'Failed to cancel', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Your appointments</h2>
        <span className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold">
          {appointments.length} total
        </span>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <div className="card-surface border-dashed p-12 flex flex-col items-center text-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-secondary grid place-items-center">
              <CalendarHeart className="w-7 h-7 text-muted-foreground" />
            </span>
            <p className="font-semibold">No appointments yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Head to <span className="font-medium text-foreground">Find Doctors</span> to book your
              first appointment.
            </p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="card-surface p-5 sm:p-6 lift">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl brand-gradient grid place-items-center shrink-0 text-white">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{appt.doctor.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        {new Date(appt.slot.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary/70" />
                        {appt.slot.startTime} – {appt.slot.endTime}
                      </span>
                      <StatusBadge status={appt.status} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 lg:max-w-xs bg-secondary/50 p-3.5 rounded-xl border border-border/60">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Your concern
                  </p>
                  <p className="text-sm italic line-clamp-2 text-foreground/80">
                    &ldquo;{appt.concern}&rdquo;
                  </p>
                </div>

                <div className="shrink-0">
                  {appt.status === 'PENDING' ? (
                    confirmId === appt.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCancel(appt.id)}
                          disabled={busy === appt.id}
                          className="flex items-center gap-1.5 bg-destructive text-white px-3.5 py-2 rounded-xl font-semibold text-sm hover:brightness-105 transition-all disabled:opacity-60"
                        >
                          {busy === appt.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-3.5 py-2 rounded-xl font-semibold text-sm bg-secondary hover:bg-secondary/70 transition-colors"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(appt.id)}
                        className="flex items-center gap-1.5 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-all font-semibold text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Cancel
                      </button>
                    )
                  ) : (
                    <span className="px-4 py-2 text-sm text-muted-foreground font-medium">
                      {appt.status === 'ACCEPTED' ? 'Confirmed' : 'Declined'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
