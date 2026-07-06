'use client';

import { useState, useEffect, useMemo } from 'react';
import { DoctorCard } from './DoctorCard';
import { toast } from '../shared/Toast';
import {
  Search,
  Loader2,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Stethoscope,
  SearchX,
} from 'lucide-react';

export default function BookingTab() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  const [form, setForm] = useState({ slotId: '', concern: '' });

  useEffect(() => {
    fetch('/api/patient/doctors')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDoctors(data);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        d.user?.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q)
    );
  }, [doctors, query]);

  const handleSelectDoctor = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setForm({ slotId: '', concern: '' });
    setSlotsLoading(true);
    setBookingStep(2);
    const res = await fetch(`/api/patient/availability/${doctor.userId}`);
    const data = await res.json();
    setAvailability(Array.isArray(data) ? data : []);
    setSlotsLoading(false);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    const res = await fetch('/api/patient/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: selectedDoctor.userId,
        slotId: form.slotId,
        concern: form.concern,
      }),
    });

    if (res.ok) {
      toast('Appointment booked! Awaiting confirmation.', 'success');
      setSelectedDoctor(null);
      setBookingStep(1);
    } else {
      const data = await res.json();
      toast(data.error || 'Failed to book appointment', 'error');
    }
    setBookingLoading(false);
  };

  /* ---------------- Step 1: browse ---------------- */
  if (bookingStep === 1) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Available specialists</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading doctors…' : `${filtered.length} doctor${filtered.length === 1 ? '' : 's'} ready to help`}
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or specialty…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-surface border-dashed p-12 flex flex-col items-center text-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-secondary grid place-items-center">
              {doctors.length === 0 ? (
                <Stethoscope className="w-7 h-7 text-muted-foreground" />
              ) : (
                <SearchX className="w-7 h-7 text-muted-foreground" />
              )}
            </span>
            <p className="font-semibold">
              {doctors.length === 0 ? 'No doctors available yet' : 'No matches found'}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {doctors.length === 0
                ? 'Please check back soon — new specialists join regularly.'
                : 'Try a different name or specialty.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {filtered.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} onBook={handleSelectDoctor} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------------- Step 2: book ---------------- */
  return (
    <div className="max-w-2xl mx-auto animate-scale-in">
      <button
        onClick={() => setBookingStep(1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to doctors
      </button>

      <div className="card-surface overflow-hidden shadow-[var(--shadow-lg)]">
        {/* Doctor header */}
        <div className="relative brand-gradient p-8 text-white">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <p className="relative text-white/80 text-xs font-bold tracking-wider uppercase mb-2">
            Booking appointment
          </p>
          <h3 className="relative text-2xl font-extrabold">{selectedDoctor.user.name}</h3>
          <p className="relative opacity-90">{selectedDoctor.specialization}</p>
        </div>

        <form onSubmit={handleBook} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Choose a time slot
            </label>

            {slotsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : availability.length === 0 ? (
              <div className="p-5 bg-secondary/60 rounded-xl flex items-center gap-3 text-sm text-muted-foreground">
                <AlertCircle className="w-5 h-5 shrink-0" />
                This doctor has no open slots right now. Try another specialist.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availability.map((slot) => {
                  const active = form.slotId === slot.id;
                  return (
                    <label
                      key={slot.id}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1 ${
                        active
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        className="hidden"
                        value={slot.id}
                        onChange={(e) => setForm({ ...form, slotId: e.target.value })}
                        required
                      />
                      <span className="font-bold text-sm">
                        {new Date(slot.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {slot.startTime}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold">Describe your concern</label>
            <textarea
              rows={4}
              className="w-full p-4 rounded-xl border border-border bg-background outline-none transition-all resize-none"
              placeholder="e.g. Constant headache for the past 3 days…"
              value={form.concern}
              onChange={(e) => setForm({ ...form, concern: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={bookingLoading || !form.slotId}
            className="w-full brand-gradient text-white py-4 rounded-xl font-bold shadow-[var(--shadow-glow)] hover:brightness-105 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {bookingLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Confirm appointment'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
