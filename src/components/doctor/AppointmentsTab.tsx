'use client';

import { useState, useEffect } from 'react';
import { StatusBadge } from '../shared/StatusBadge';
import { CardSkeleton } from '../shared/Skeleton';
import { toast } from '../shared/Toast';
import {
  Check,
  X,
  Calendar,
  User,
  MessageSquare,
  Clock,
  CalendarX2,
  Inbox,
  CalendarCheck,
} from 'lucide-react';

interface Appt {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  concern: string;
  patient: { name: string };
  slot: { date: string; startTime: string; endTime?: string };
}

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchAppointments = async () => {
    const res = await fetch('/api/doctor/appointments');
    const data = await res.json();
    if (Array.isArray(data)) setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    setBusy(id);
    const res = await fetch(`/api/doctor/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (res.ok) {
      toast(action === 'accept' ? 'Appointment accepted' : 'Appointment declined', action === 'accept' ? 'success' : 'info');
      fetchAppointments();
    } else {
      toast('Something went wrong', 'error');
    }
  };

  const pending = appointments.filter((a) => a.status === 'PENDING').length;
  const accepted = appointments.filter((a) => a.status === 'ACCEPTED').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Inbox} label="Total requests" value={appointments.length} tone="primary" />
        <StatCard icon={Clock} label="Awaiting review" value={pending} tone="amber" />
        <StatCard icon={CalendarCheck} label="Accepted" value={accepted} tone="emerald" />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Patient requests</h2>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <EmptyState />
        ) : (
          appointments.map((appt) => (
            <div
              key={appt.id}
              className="card-surface p-5 sm:p-6 lift"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl brand-gradient grid place-items-center shrink-0 text-white font-bold">
                    {appt.patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{appt.patient.name}</h3>
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
                        {appt.slot.startTime}
                      </span>
                      <StatusBadge status={appt.status} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 lg:max-w-sm bg-secondary/50 border border-border/60 p-3 rounded-xl">
                  <div className="flex gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <p className="italic text-muted-foreground line-clamp-2">
                      &ldquo;{appt.concern}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {appt.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleAction(appt.id, 'accept')}
                        disabled={busy === appt.id}
                        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-colors font-semibold text-sm disabled:opacity-60"
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleAction(appt.id, 'reject')}
                        disabled={busy === appt.id}
                        className="flex items-center gap-1.5 bg-secondary hover:bg-destructive/10 hover:text-destructive text-secondary-foreground px-4 py-2.5 rounded-xl transition-colors font-semibold text-sm disabled:opacity-60"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground font-medium">
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

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: 'primary' | 'amber' | 'emerald';
}) {
  const tones = {
    primary: 'text-primary bg-primary/10',
    amber: 'text-amber-600 bg-amber-500/10 dark:text-amber-300',
    emerald: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-300',
  };
  return (
    <div className="card-surface p-5 flex items-center gap-4">
      <span className={`w-11 h-11 rounded-xl grid place-items-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card-surface p-12 flex flex-col items-center text-center gap-3 border-dashed">
      <span className="w-14 h-14 rounded-2xl bg-secondary grid place-items-center">
        <CalendarX2 className="w-7 h-7 text-muted-foreground" />
      </span>
      <p className="font-semibold">No appointment requests yet</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Once patients book with you, their requests will appear here for review.
      </p>
    </div>
  );
}
